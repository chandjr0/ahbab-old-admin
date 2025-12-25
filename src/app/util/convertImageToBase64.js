const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      // Read the file as a Data URL
      resolve(event.target.result); // Return the original Base64 string directly
    };

    // Handle file read errors
    reader.onerror = () => {
      reject(new Error("Failed to read the file."));
    };

    // Start reading the file
    reader.readAsDataURL(file);
  });
};

module.exports = {
  convertImageToBase64,
};
