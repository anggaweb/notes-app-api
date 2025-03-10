const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Proses semua file .js
                exclude: /node_modules/, // Kecualikan folder node_modules
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            },
            {
                test: /\.css$/, // Untuk file CSS
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    mode: 'development'
};
