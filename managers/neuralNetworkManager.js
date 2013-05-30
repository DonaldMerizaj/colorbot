var brain = require('brain');

NeuralNetworkManager = {
	net: new brain.NeuralNetwork({ hiddenLayers: [6] }),

	run: function(data, callback) {
		NeuralNetworkManager.initialize();
		
		NeuralNetworkManager.runNeuralNetwork(data, function(results) {
			if (callback != null) {
				callback(results);
			}
		});
	},
	
	runNeuralNetwork: function(data, onComplete, isTraining) {
		var trainingSet = [];
		var result = [];
				
		// Convert the data into a training set.
		for (var i in data) {
			// A training row is ready.
			trainingSet.push({ input: NeuralNetworkManager.normalize(data[i].pixels), output: NeuralNetworkManager.formatOutputVector(data[i].y) });
		}

		console.log('Loaded ' + trainingSet.length + ' records.');
		
		// Train neural network.
		if (isTraining) {
			console.log('Training');
			NeuralNetworkManager.net.train(trainingSet, { errorThresh: 0.0000001, iterations: 30, log: true, logPeriod: 1 });
		}
		
		// Determine accuracy against data.
		var correct = 0;
		for (var i in trainingSet) {
			var resultItem = {};
			resultItem.correct = false;
			resultItem.file = data[i].file;
			
			var output = NeuralNetworkManager.net.run(trainingSet[i].input);
			var actual = NeuralNetworkManager.formatOutputResult(output);
			var expected = NeuralNetworkManager.formatOutputResult(trainingSet[i].output);

			resultItem.value = Math.max.apply(null, output);
			
			if (expected == actual) {
				correct++;
				resultItem.correct = true;
			}
			
			switch (actual) {
				case 0: resultItem.color = 'Red'; break;
				case 1: resultItem.color = 'Green'; break;
				case 2: resultItem.color = 'Blue'; break;
			};
			
			result.push(resultItem);
		}
		
		console.log('Accuracy: ' + ((correct / trainingSet.length) * 100).toFixed(2) + '%');
		
		// Call callback.
		if (onComplete) {
			onComplete(result);
		}
	},

	formatOutputVector: function(output) {
		var vector = [];
		
		switch (output) {
			case 0 : vector = [1, 0, 0]; break;
			case 1 : vector = [0, 1, 0]; break;
			case 2 : vector = [0, 0, 1]; break;
		};
		
		return vector;
	},

	formatOutputResult: function(output) {
		var maxX = Math.max.apply(null, output);	
		return output.indexOf(maxX);	
	},

	normalize: function(data) {
		// Convert csv string values to integer.
		for (var i=0; i<data.length; i++) {
			var value = data[i];
			
			// Normalize feature input.
			if (i < data.length - 1) {
				value = (value - 127) / 255;
			}
			
			data[i] = value;
		}
		
		return data;
	},
	
	initialize: function() {
	}
};