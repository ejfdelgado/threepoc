import {
  dot as tf_dot,
  sigmoid as tf_sigmoid,
  oneHot as tf_oneHot,
  tensor2d as tf_tensor2d,
  tensor as tf_tensor,
  sequential as tf_sequential,
  layers as tf_layers,
  train as tf_train
} from "@tensorflow/tfjs";
import { show } from "../js/tfjs-vis";

const perceptron = ({ x, w, bias }) => {
  const product = tf_dot(x, w).dataSync()[0];
  return product + bias < 0 ? 0 : 1;
};

const sigmoidPerceptron = ({ x, w, bias }) => {
  const product = tf_dot(x, w).dataSync()[0];
  return tf_sigmoid(product + bias).dataSync()[0];
};

const oneHot = (val, categoryCount) =>
  Array.from(tf_oneHot(val, categoryCount).dataSync());

const renderLayer = (model, layerName, container) => {
  show.layer(
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

  const X = tf_tensor2d([
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
  const y = tf_tensor([0, 0, 1, 1, 0, 0, 1, 1, 1].map(y => oneHot(y, 2)));

  const model = tf_sequential();

  model.add(
    tf_layers.dense({
      name: "hidden-layer",
      inputShape: [2],
      units: 3,
      activation: "relu"
    })
  );

  model.add(
    tf_layers.dense({
      units: 2,
      activation: "softmax"
    })
  );

  model.compile({
    optimizer: tf_train.adam(0.1),
    loss: "binaryCrossentropy",
    metrics: ["accuracy"]
  });

  const lossContainer = document.getElementById("loss-cont");

  await model.fit(X, y, {
    shuffle: true,
    epochs: 20,
    validationSplit: 0.1,
    callbacks: null
  });

  const hiddenLayer = model.getLayer("hidden-layer");
  const [weights, biases] = hiddenLayer.getWeights(true);
  console.log(weights.shape);
  console.log(biases.shape);

  renderLayer(model, "hidden-layer", "hidden-layer-container");

  const predProb = model.predict(tf_tensor2d([[0.1, 0.6]])).dataSync();

  console.log(predProb);
};


$(function () {

  run();

});