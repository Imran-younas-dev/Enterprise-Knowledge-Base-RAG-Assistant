module.exports = {
    parser: '@babel/eslint-parser',
    parserOptions: {
        requireConfigFile: false,
        ecmaVersion: 2022,
        sourceType: 'module',
        babelOptions: {
            plugins: [['@babel/plugin-proposal-decorators', { legacy: true }]],
        },
    },
    extends: ['eslint:recommended', 'plugin:prettier/recommended'],
    env: {
        node: true,
        es2022: true,
    },
    rules: {
        'no-console': 'error',
        'no-var': 'error',
        'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'prettier/prettier': 'error',
        'max-len': [
            'error',
            {
                code: 120,
                ignoreStrings: true,
                ignoreComments: true,
                ignoreTemplateLiterals: true,
            },
        ],
    },
}
