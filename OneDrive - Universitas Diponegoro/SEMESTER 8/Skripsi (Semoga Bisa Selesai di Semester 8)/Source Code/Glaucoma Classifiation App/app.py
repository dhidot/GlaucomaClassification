from flask import Flask, render_template, request, redirect, url_for
import numpy as np
from PIL import Image
from keras.preprocessing import image as keras_image
from keras.models import load_model
from werkzeug.utils import secure_filename
from gevent.pywsgi import WSGIServer

app = Flask(__name__)

# Load saved model
bestModel = load_model('models\model_16_0.0001_60.h5')

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
    # app.run()
    # Serve the app with gevent
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()
