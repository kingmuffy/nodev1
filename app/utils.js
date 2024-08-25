export const getAverageColor = (image) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const width = (canvas.width = image.width);
  const height = (canvas.height = image.height);

  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  let r = 0,
    g = 0,
    b = 0;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }

  r = Math.floor(r / (data.length / 4));
  g = Math.floor(g / (data.length / 4));
  b = Math.floor(b / (data.length / 4));

  return `rgb(${r},${g},${b})`;
};
