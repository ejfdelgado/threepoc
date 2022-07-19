import * as tf from "../../../node_modules/@tensorflow/tfjs/dist/index.js";
import * as tfvis from "../../../node_modules/@tensorflow/tfjs-vis/dist/index.js";

const perceptron = ({ x, w, bias }) => {
  const product = tf.dot(x, w).dataSync()[0];
  return product + bias < 0 ? 0 : 1;
};

const sigmoidPerceptron = ({ x, w, bias }) => {
  const product = tf.dot(x, w).dataSync()[0];
  return tf.sigmoid(product + bias).dataSync()[0];
};

const oneHot = (val, categoryCount) =>
  Array.from(tf.oneHot(val, categoryCount).dataSync());

const renderLayer = (model, layerName, container) => {
  tfvis.show.layer(
    document.getElementById(container),
    model.getLayer(layerName)
  );
};

const run = async () => {
  console.log(
    perceptron({
      x: [0, 1],
      w: [0.5, 0.9],
      bias: -0.5
    })
  );

  console.log(
    sigmoidPerceptron({
      x: [0.6, 0.9],
      w: [0.5, 0.9],
      bias: -0.5
    })
  );

  const X = tf.tensor2d([
    // pink, small
    [0.1, 0.1],
    [0.3, 0.3],
    [0.5, 0.6],
    [0.4, 0.8],
    [0.9, 0.1],
    [0.75, 0.4],
    [0.75, 0.9],
    [0.6, 0.9],
    [0.6, 0.75]
  ]);

  // 0 - no buy, 1 - buy
  const y = tf.tensor([0, 0, 1, 1, 0, 0, 1, 1, 1].map(y => oneHot(y, 2)));

  const model = tf.sequential();

  model.add(
    tf.layers.dense({
      name: "hidden-layer",
      inputShape: [2],
      units: 3,
      activation: "relu"
    })
  );

  model.add(
    tf.layers.dense({
      units: 2,
      activation: "softmax"
    })
  );

  model.compile({
    optimizer: tf.train.adam(0.1),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"]
  });

  const lossContainer = document.getElementById("loss-cont");

  await model.fit(X, y, {
    shuffle: true,
    epochs: 20,
    validationSplit: 0.1,
    callbacks: tfvis.show.fitCallbacks(
      lossContainer,
      ["loss", "val_loss", "acc", "val_acc"],
      {
        callbacks: ["onEpochEnd"]
      }
    )
  });

  const hiddenLayer = model.getLayer("hidden-layer");
  const [weights, biases] = hiddenLayer.getWeights(true);
  console.log(weights.shape);
  console.log(biases.shape);

  renderLayer(model, "hidden-layer", "hidden-layer-container");

  const predProb = model.predict(tf.tensor2d([[0.1, 0.6]])).dataSync();

  console.log(predProb);
};


$(function () {

  run();

});