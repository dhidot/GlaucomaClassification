import tensorflow as tf
import os
import numpy as np
from keras.preprocessing import image as keras_image
from keras.models import load_model
from PIL import Image
from flask import Flask, render_template, request, redirect, url_for
from dotenv import load_dotenv
from flask_cors import CORS

# Load the environment variables
load_dotenv()

app = Flask(__name__)
CORS(app) # Enable CORS for all routes and origins

# Konfigurasi FLASK_DEBUG pada environment variables
app.config['DEBUG'] = os.environ.get('FLASK_DEBUG')

# Load saved model
bestModel = load_model('models/model_16_0.0001_60.h5')

# Load and preprocess image
def preproccessImage(imagePath):
    img = Image.open(imagePath).convert('RGB')
    img = img.resize((299, 299))
    imgArray = keras_image.img_to_array(img)
    imgArray = ((imgArray / 255.0) * 2.0) - 1.0
    imgArray = np.expand_dims(imgArray, axis=0)
    return imgArray


def predictImage(imagePath):
    img = preproccessImage(imagePath)
    prediction = bestModel.predict(img)
    binaryPrediction = (prediction > 0.5).astype("int")
    # Print the prediction value
    print("Prediction:", prediction)
    print("Binary Prediction:", binaryPrediction)
    return binaryPrediction


@app.route('/')
def root():
    # Redirect to the home route
    return redirect(url_for('index'))


@app.route('/home')
def index():
    return render_template('index.html')


@app.route('/prediksi', methods=['GET'])
def prediksi():
    return render_template('prediksi.html')

@app.route('/help', methods=['GET'])
def help():
    return render_template('help.html')


@app.route('/predict', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        f = request.files['file']
        f.save('uploads/' + f.filename)
        prediction = predictImage('uploads/' + f.filename)
        if prediction[0][0] == 0:
            result = 'Mata ini normal'
        else:
            result = 'Mata ini terindikasi mengalami Glaukoma'
        return result
    return None


if __name__ == '__main__':
    app.run(debug=True)
