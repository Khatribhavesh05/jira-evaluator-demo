// File Upload Handler with size validation
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const handleFileUpload = (file) => {
  if (file.size > MAX_FILE_SIZE) {
    showError('File size must be under 5MB')
    return
  }
  processUpload(file)
}

const showError = (message) => {
  const errorDiv = document.getElementById('error-message')
  errorDiv.textContent = message
  errorDiv.style.display = 'block'
}

module.exports = { handleFileUpload }
