import path from 'path';
import { fileURLToPath } from 'url';

// When using ES modules, __dirname is not defined. This is a workaround to get the directory name.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  target: 'webworker',
  entry: './src/index.ts', // Adjust the path to your entry TypeScript file
  mode: 'production',
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'worker.js', // Output bundle filename
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          // Add any necessary options for ts-loader here
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'], // Resolve .ts and .js files
  },
};

