# Dewais-Test-App

The application analyzes input text string, and calculates type of words in it: noun, verb, adverb, adjective... etc. The application consists of single page with form (React application) and one back-end endpoint. 

AWS resources/services used in app implementation:

- **S3** bucket with website properties for hosting compiled React app 
- **Lambda** does text string analyze 
- **API Gateway HTTP API** exposes HTTP endpoint for Lambda function 
- **CloudFront** wraps S3 website and API endpoint in one domain name, adds HTTPS certificates.



## Build and Deploy 

Prerequerences:
- NodeJS 18+
- Terraform CLI 1.3.7+
- AWS account

Provisioning of serverless AWS infrastructure is done with terraform scripts.

After cloning the repository, to build and deploy the application on AWS Cloud, follow the following steps:

 1. Compile and build static HTML/JS/CSS and JS-code for Lambda. Run commands:
```
	npm install
	npm run build
```
 2. Make sure there AWS account crenelation in file `~/.aws/credentials`. More about this file [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html)
 3. In file `terraform/provider.tf` set desirable region and AWS profile name.
 4. Run commands:
```
cd terraform
terraform init
terraform apply
```
 5. After Terraform scripts are applied, the link to the application will be in output:
```
Apply complete! Resources: 24 added, 0 changed, 0 destroyed.

Outputs:

cloudfront_url = "https://xxxxxxxxxx.cloudfront.net"
```
Follow the link.