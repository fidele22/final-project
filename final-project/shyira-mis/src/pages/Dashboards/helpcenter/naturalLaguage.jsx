// IntentClassifier.js
import natural from 'natural';

const classifier = new natural.BayesClassifier();

// Train the classifier with intents and examples
classifier.addDocument('hi', 'greeting');
classifier.addDocument('hello', 'greeting');
classifier.addDocument('hey', 'greeting');
classifier.addDocument('what are your operating hours?', 'operating_hours');
classifier.addDocument('how can I reset my password?', 'reset_password');
classifier.addDocument('where is the nearest hospital?', 'nearest_hospital');
classifier.addDocument('what services do you offer?', 'services_offered');
classifier.addDocument('how can I contact support?', 'contact_support');

// Train the classifier
classifier.train();

export const classifyIntent = (input) => {
  const normalizedInput = input.trim().toLowerCase();
  return classifier.classify(normalizedInput);
};