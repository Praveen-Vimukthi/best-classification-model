from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, MinMaxScaler, RobustScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.impute import KNNImputer
from imblearn.under_sampling import RandomUnderSampler
from imblearn.over_sampling import RandomOverSampler, SMOTE
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import pickle, io, os

app = Flask(__name__)
CORS(app)

PICKLE_DIR = "saved_models"
os.makedirs(PICKLE_DIR, exist_ok=True)


# ============================================================
# EXACT FUNCTIONS FROM YOUR NOTEBOOK — not changed at all
# ============================================================

def extract_numerical_text(df):
    num_cols  = df.select_dtypes(include=['int16','int32','int64','float32','float64']).columns
    text_cols = df.select_dtypes(exclude=['int16','int32','int64','float32','float64']).columns
    df_num    = df[num_cols]
    df_text   = df[text_cols]
    return df_num, df_text, num_cols, text_cols

def combineDFs(df_1, df_2):
    return pd.concat([df_1, df_2], axis=1)

def move_label_column(df, label_col_number):
    if label_col_number != -1:
        cols = list(range(df.shape[1]))
        col  = cols.pop(label_col_number)
        cols.append(col)
        df   = df.iloc[:, cols]
    return df

def handle_missing_values(df, method):
    if method == "drop":
        df.dropna(inplace=True)
    elif method == "impute":
        df_num, df_text, num_cols, text_cols = extract_numerical_text(df)
        imputer        = KNNImputer(n_neighbors=3)
        df_num_imputed = imputer.fit_transform(df_num)
        df_num         = pd.DataFrame(df_num_imputed, columns=num_cols)
        df             = combineDFs(df_num, df_text)
    return df

def encodeLabels(Y):
    le = LabelEncoder()
    Y  = le.fit_transform(Y)
    return le, Y

def split(df, label_col_number, testSize, randomState):
    df = move_label_column(df, label_col_number)
    X  = df.iloc[:, :-1]
    Y  = df.iloc[:, -1]
    le, Y_encoded = encodeLabels(Y)
    X_train, X_test, Y_train, Y_test = train_test_split(
        X, Y_encoded, test_size=testSize, stratify=Y_encoded, random_state=randomState
    )
    return df, X, Y_encoded, X_train, Y_train, X_test, Y_test, le

def handle_imbalace(X_train, Y_train, handleImbalance):
    if handleImbalance == "under":
        under_sampler = RandomUnderSampler(sampling_strategy='auto', random_state=69)
        X_train, Y_train = under_sampler.fit_resample(X_train, Y_train)
    elif handleImbalance == "over":
        over_sampler = RandomOverSampler(sampling_strategy='auto', random_state=69)
        X_train, Y_train = over_sampler.fit_resample(X_train, Y_train)
    elif handleImbalance == "smote":
        X_train_num, _, _, _ = extract_numerical_text(pd.DataFrame(X_train))
        smote    = SMOTE(random_state=69, k_neighbors=1)
        X_train, Y_train = smote.fit_resample(X_train_num, Y_train)
    return X_train, Y_train

def remove_text_cols(X_train, X_test):
    X_train_num, _, _, _ = extract_numerical_text(X_train)
    X_test_num,  _, _, _ = extract_numerical_text(X_test)
    return X_train_num, X_test_num

def Standardize(X_train, X_test, method='standard'):
    # your notebook used StandardScaler; we also support minmax/robust from settings
    num_cols = X_train.select_dtypes(
        include=['int16','int32','int64','float32','float64']
    ).columns

    if method == 'minmax':
        scaler = MinMaxScaler()
    elif method == 'robust':
        scaler = RobustScaler()
    else:
        scaler = StandardScaler()   # default — same as your notebook

    X_train = pd.DataFrame(scaler.fit_transform(X_train), columns=num_cols)
    X_test  = pd.DataFrame(scaler.transform(X_test),      columns=num_cols)
    return X_train, X_test, scaler

def has_header(file_path):
    df_sample = pd.read_csv(file_path, nrows=5)

    first_row = df_sample.iloc[0]

    non_numeric = 0
    for v in first_row:
        if not str(v).replace('.', '', 1).isdigit():
            non_numeric += 1

    return non_numeric > len(first_row) / 2

# ============================================================
# POST /predict
#
# Receives from React frontend (FormData):
#   file              – CSV upload
#   models            – comma-separated ids e.g. "knn,svm"
#   test_size         – float  (from trainTestSplit slider)
#   random_state      – int    (from randomState input)
#   label_col_index   – int    (-1 = last column)
#   missing_method    – "drop" | "impute"
#   imbalance_method  – "skip" | "under" | "over" | "smote"
#   scaling_method    – "none" | "standard" | "minmax" | "robust"
#   primary_metric    – "accuracy" | "precision" | "recall" | "f1"
#   knn_neighbors     – int  (n_neighbors for KNN)
# ============================================================

# maps frontend model id → (sklearn class, needs_std flag)
MODEL_REGISTRY = {
    'logistic':      (LogisticRegression,  True),
    'knn':           (KNeighborsClassifier, True),
    'decision_tree': (DecisionTreeClassifier, False),
    'random_forest': (RandomForestClassifier, False),   
    'svm':           (SVC,             True),
    'naive_bayes':   (GaussianNB,      False),
}

# human-readable names matching your notebook
MODEL_NAMES = {
    'logistic':      'Logistic Regression',
    'knn':           'K-Nearest Neighbors',
    'decision_tree': 'Decision Tree',
    'random_forest': 'Random Forest',
    'svm':           'Support Vector Machine',
    'naive_bayes':   'Naive Bayes',
}

@app.route('/predict', methods=['POST'])
def predict():

    # ── 1. Validate file ────────────────────────────────────────────────────
    if 'file' not in request.files:
        return jsonify({'error': 'No CSV file uploaded'}), 400

    # ── 2. Read all settings from frontend ──────────────────────────────────
    selected_ids = [m.strip() for m in request.form.get('models', '').split(',') if m.strip()]
    if not selected_ids:
        return jsonify({'error': 'No models selected'}), 400

    invalid = [m for m in selected_ids if m not in MODEL_REGISTRY]
    if invalid:
        return jsonify({'error': f'Unknown model IDs: {invalid}'}), 400

    try:
        test_size        = float(request.form.get('test_size',       0.2))
        random_state     = int(  request.form.get('random_state',    69))
        label_col_index  = int(  request.form.get('label_col_index', -1))
        missing_method   =       request.form.get('missing_method',  'drop')
        imbalance_method =       request.form.get('imbalance_method','skip')
        scaling_method   =       request.form.get('scaling_method',  'standard')
        primary_metric   =       request.form.get('primary_metric',  'accuracy')
        knn_neighbors    = int(  request.form.get('knn_neighbors',   5))
    except ValueError as e:
        return jsonify({'error': f'Invalid config value: {e}'}), 400

    # ── 3. Read CSV ─────────────────────────────────────────────────────────
    try:
        
        if not os.path.exists("uploads"):
            os.makedirs("uploads")

        file = request.files['file']
        filename = secure_filename(file.filename)

        file_path = os.path.join("uploads", filename)
        file.save(file_path)

        if(has_header(file_path)):
            df = pd.read_csv(file_path)
        else:
            df = pd.read_csv(file_path, header=None)

    except Exception as e:
        return jsonify({'error': f'Could not read CSV: {e}'}), 400

    if df.shape[1] < 2:
        return jsonify({'error': 'CSV must have at least 2 columns'}), 400

    # ── 4. handle_missing_values() — exact notebook function ────────────────
    df = handle_missing_values(df, missing_method)
    if df.shape[0] < 10:
        return jsonify({'error': 'Too few rows after handling missing values'}), 400

    # ── 5. split() — exact notebook function ────────────────────────────────
    try:
        df, X, Y_encoded, X_train, Y_train, X_test, Y_test, le = split(
            df, label_col_index, test_size, random_state
        )
    except Exception as e:
        return jsonify({'error': f'Train/test split failed: {e}'}), 400

    # ── 6. handle_imbalace() — exact notebook function ──────────────────────
    try:
        X_train, Y_train = handle_imbalace(X_train, Y_train, imbalance_method)
    except Exception as e:
        return jsonify({'error': f'Imbalance handling failed: {e}'}), 400

    # ── 7. Train each model — exact notebook loop ───────────────────────────
    results         = []
    best_model_name = None
    best_score      = -1
    best_clf        = None
    best_scaler     = None

    avg = 'binary' if len(np.unique(Y_encoded)) == 2 else 'weighted'

    # Restore DataFrame column names if lost after imbalance handling
    original_num_cols = list(extract_numerical_text(X)[0].columns)
    if not isinstance(X_train, pd.DataFrame):
        X_train = pd.DataFrame(X_train, columns=original_num_cols[:X_train.shape[1]])
    if not isinstance(X_test, pd.DataFrame):
        X_test  = pd.DataFrame(X_test,  columns=original_num_cols[:X_test.shape[1]])

    for model_id in selected_ids:
        ModelClass, needs_std = MODEL_REGISTRY[model_id]
        if ModelClass is None:
            continue  

        X_tr, X_te = remove_text_cols(X_train.copy(), X_test.copy())

        scaler = None
        try:
            # Standardize() — exact notebook function
            # only run if model needs it AND user hasn't chosen "none"
            if needs_std and scaling_method != 'none':
                X_tr, X_te, scaler = Standardize(X_tr, X_te, scaling_method)

            # Build model with correct hyperparams from frontend settings
            if model_id == 'knn':
                clf = KNeighborsClassifier(n_neighbors=knn_neighbors)
            elif model_id == 'logistic':
                clf = LogisticRegression(max_iter=1000, random_state=random_state)
            elif model_id == 'decision_tree':
                clf = DecisionTreeClassifier(random_state=random_state)
            elif model_id == 'svm':
                clf = SVC(kernel='linear')
            elif model_id == 'naive_bayes':
                clf = GaussianNB()
            elif model_id == 'random_forest':
                clf = RandomForestClassifier(n_estimators=100, random_state=random_state)
            else:
                continue

            use_cv = request.form.get('cross_validation') == 'true'
            cv_folds = int(request.form.get('cv_folds', 5))

            if use_cv:
                # combine train+test back together for CV to use all data
                X_all = pd.concat([X_tr, X_te], axis=0).reset_index(drop=True)
                Y_all = np.concatenate([Y_train, Y_test])

                acc  = float(cross_val_score(clf, X_all, Y_all, cv=cv_folds, scoring='accuracy').mean())
                prec = float(cross_val_score(clf, X_all, Y_all, cv=cv_folds, scoring='precision_weighted').mean())
                rec  = float(cross_val_score(clf, X_all, Y_all, cv=cv_folds, scoring='recall_weighted').mean())
                f1   = float(cross_val_score(clf, X_all, Y_all, cv=cv_folds, scoring='f1_weighted').mean())

                # still fit on full training data so pickle has a trained model
                clf.fit(X_tr, Y_train)
            else:
                clf.fit(X_tr, Y_train)
                Y_pred = clf.predict(X_te)

                acc  = float(accuracy_score(Y_test,  Y_pred))
                prec = float(precision_score(Y_test, Y_pred, average=avg, zero_division=0))
                rec  = float(recall_score(Y_test,    Y_pred, average=avg, zero_division=0))
                f1   = float(f1_score(Y_test,        Y_pred, average=avg, zero_division=0))

            score = {'accuracy': acc, 'precision': prec, 'recall': rec, 'f1': f1}.get(primary_metric, acc)

            results.append({
                'name':      MODEL_NAMES[model_id],
                'accuracy':  round(acc,  4),
                'precision': round(prec, 4),
                'recall':    round(rec,  4),
                'f1':        round(f1,   4),
            })

            # exact notebook: track best by chosen metric
            if score > best_score:
                best_score      = score
                best_model_name = MODEL_NAMES[model_id]
                best_clf        = clf
                best_scaler     = scaler if needs_std else None

        except Exception as e:
            results.append({
                'name':      MODEL_NAMES[model_id],
                'accuracy':  0, 'precision': 0, 'recall': 0, 'f1': 0,
                'error':     str(e),
            })

    # ── 8. Save best model as pickle ────────────────────────────────────────
    pickle_saved = False
    if best_clf is not None:
        pickle_data = {
            'model':          best_clf,
            'scaler':         best_scaler,
            'label_encoder':  le,
            'model_name':     best_model_name,
            'primary_metric': primary_metric,
            'best_score':     round(best_score, 4),
            'config': {
                'test_size':        test_size,
                'random_state':     random_state,
                'missing_method':   missing_method,
                'imbalance_method': imbalance_method,
                'scaling_method':   scaling_method,
                'knn_neighbors':    knn_neighbors,
                'label_col_index':  label_col_index,
            }
        }
        with open(os.path.join(PICKLE_DIR, 'best_model.pkl'), 'wb') as f:
            pickle.dump(pickle_data, f)
        pickle_saved = True

    return jsonify({
        'results':      results,
        'best_model':   best_model_name,
        'pickle_saved': pickle_saved,
    })


# ── GET /download-model ──────────────────────────────────────────────────────
@app.route('/download-model', methods=['GET'])
def download_model():
    path = os.path.join(PICKLE_DIR, 'best_model.pkl')
    if not os.path.exists(path):
        return jsonify({'error': 'No model trained yet. Run predict first.'}), 404
    return send_file(path, as_attachment=True, download_name='best_model.pkl')


# ── Health check ─────────────────────────────────────────────────────────────
@app.route('/', methods=['GET'])
def health():
    return jsonify({'status': 'ML backend running'})


if __name__ == '__main__':
    app.run(debug=True, port=5000)
