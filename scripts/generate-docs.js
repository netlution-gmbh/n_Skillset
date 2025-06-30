import fs from 'fs';

import swaggerJsdoc from 'swagger-jsdoc';

import path from 'path';

const options = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'Skillset API',
			version: '1.0.0',
			description: 'API documentation for the Skillset application'
		},
		servers: [
			{
				url: 'http://localhost:5173',
				description: 'Development server'
			}
		]
	},
	apis: ['./src/routes/api/**/*.ts', './src/lib/server/models/*.ts']
};

const openapiSpecification = swaggerJsdoc(options);

// Create the directory if it doesn't exist
const outputDir = path.resolve('./src/routes/swagger-ui');
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
}

// Write the OpenAPI specification to a file
fs.writeFileSync(path.resolve(outputDir, 'openapi.json'), JSON.stringify(openapiSpecification, null, 2));

console.log('OpenAPI specification generated successfully!');
