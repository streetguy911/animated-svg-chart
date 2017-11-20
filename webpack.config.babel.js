const path = require('path');

export default {
    devtool: 'eval',
    entry: ['./src/app.jsx'],

    output: {
        path: path.join(__dirname, '/dist'),
        publicPath: '/',
        filename: 'scripts.js'
    },
    module: {
        rules: [
            {
                test: /\.js|x$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.scss$/,
                exclude: /node_modules/,

                use: [
                    'style-loader',
                    'css-loader?importLoaders=2?sourceMap',
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true
                        }

                    }
                ]
            }
        ]
    },

    resolve: {
        modules: [path.resolve(__dirname, './'), '.', 'node_modules'],
        extensions: ['.js', '.jsx', '.css', '.scss'],
        alias: {
            root: 'src',
            components: 'src/components'
        }
    },

    devServer: {
        historyApiFallback: {
            rewrites: [
                { from: '/demo2$', to: 'demo2.html' },
                { from: '/demo1$', to: 'demo1.html' },
            ]
        }
    }
};
