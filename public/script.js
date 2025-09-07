document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('upload-form');
  const fileInput = document.getElementById('selfie-input');
  const previewContainer = document.getElementById('preview-container');
  const previewImg = document.getElementById('preview-img');
  const emojiSection = document.getElementById('emoji-suggestions');
  const emojiOutput = document.getElementById('emojis');
  const errorMessage = document.getElementById('error-message');

  async function loadModels() {
    try {
      console.log("Loading models...");
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models/tiny_face_detector');
      await faceapi.nets.faceExpressionNet.loadFromUri('/models/face_expression');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models/face_landmark_68');
      console.log("Models loaded successfully.");
    } catch (err) {
      console.error("Model loading failed:", err);
      errorMessage.textContent = 'Failed to load models. Check console for details.';
      errorMessage.classList.remove('hidden');
    }
  }

  function suggestEmoji(expression) {
    switch (expression) {
      case 'happy': return '😊';
      case 'sad': return '😢';
      case 'angry': return '😠';
      case 'surprised': return '😲';
      case 'neutral': return '😐';
      case 'disgusted': return '🤢';
      case 'fearful': return '😨';
      default: return '❓';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Form submitted');

    errorMessage.classList.add('hidden');
    emojiSection.classList.add('hidden');
    previewContainer.classList.add('hidden');
    emojiOutput.innerHTML = '';

    const file = fileInput.files[0];
    if (!file) {
      errorMessage.textContent = 'Please upload a selfie.';
      errorMessage.classList.remove('hidden');
      return;
    }

    const img = await faceapi.bufferToImage(file);
    previewImg.src = img.src;
    previewContainer.classList.remove('hidden');

    const detection = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();

    if (!detection) {
      console.warn('No face detected.');
      errorMessage.textContent = 'No face detected. Try another image.';
      errorMessage.classList.remove('hidden');
      return;
    }

    const expressions = detection.expressions;
    const topExpression = Object.entries(expressions).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    const emoji = suggestEmoji(topExpression);
    emojiOutput.innerHTML = `
      <p><strong>${topExpression}</strong> → <span style="font-size: 2.5rem">${emoji}</span></p>
    `;
    emojiSection.classList.remove('hidden');
  });

  // Load models when page loads
  loadModels();
});

