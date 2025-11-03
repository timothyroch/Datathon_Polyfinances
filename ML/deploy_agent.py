import boto3
import json
import zipfile
import os
from pathlib import Path

def create_lambda_package():
    """Crée le package Lambda pour l'agent"""
    # Créer le dossier de déploiement
    deploy_dir = Path("lambda_package")
    deploy_dir.mkdir(exist_ok=True)
    
    # Copier le code de l'agent
    with open(deploy_dir / "lambda_function.py", "w") as f:
        f.write("""
import boto3
import json

def lambda_handler(event, context):
    bedrock_client = boto3.client('bedrock-runtime')
    
    # Extraire le prompt de l'événement
    prompt = event.get('prompt', 'Hello')
    
    try:
        response = bedrock_client.invoke_model(
            modelId="global.anthropic.claude-sonnet-4-5-20250929-v1:0",
            messages=[{"role": "user", "content": [{"text": prompt}]}],
            inferenceConfig={
                "temperature": 0.1,
                "maxTokens": 10000
            }
        )
        
        result = response["output"]["message"]["content"][0]["text"]
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'response': result
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }
""")
    
    # Créer le ZIP
    with zipfile.ZipFile("bedrock_agent.zip", "w") as zip_file:
        zip_file.write(deploy_dir / "lambda_function.py", "lambda_function.py")
    
    print("Package Lambda créé: bedrock_agent.zip")

def deploy_lambda_function():
    """Déploie la fonction Lambda"""
    lambda_client = boto3.client('lambda')
    iam_client = boto3.client('iam')
    
    # Créer le rôle IAM
    trust_policy = {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {"Service": "lambda.amazonaws.com"},
                "Action": "sts:AssumeRole"
            }
        ]
    }
    
    try:
        role_response = iam_client.create_role(
            RoleName='BedrockAgentRole',
            AssumeRolePolicyDocument=json.dumps(trust_policy),
            Description='Role for Bedrock Agent Lambda'
        )
        role_arn = role_response['Role']['Arn']
    except iam_client.exceptions.EntityAlreadyExistsException:
        role_arn = iam_client.get_role(RoleName='BedrockAgentRole')['Role']['Arn']
    
    # Attacher les politiques
    policies = [
        'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
        'arn:aws:iam::aws:policy/AmazonBedrockFullAccess'
    ]
    
    for policy in policies:
        try:
            iam_client.attach_role_policy(RoleName='BedrockAgentRole', PolicyArn=policy)
        except:
            pass
    
    # Créer la fonction Lambda
    with open("bedrock_agent.zip", "rb") as zip_file:
        try:
            response = lambda_client.create_function(
                FunctionName='bedrock-agent',
                Runtime='python3.11',
                Role=role_arn,
                Handler='lambda_function.lambda_handler',
                Code={'ZipFile': zip_file.read()},
                Description='Bedrock AI Agent',
                Timeout=60,
                MemorySize=256
            )
            print(f"Fonction Lambda créée: {response['FunctionArn']}")
        except lambda_client.exceptions.ResourceConflictException:
            # Mettre à jour si existe déjà
            zip_file.seek(0)
            lambda_client.update_function_code(
                FunctionName='bedrock-agent',
                ZipFile=zip_file.read()
            )
            print("Fonction Lambda mise à jour")

def create_api_gateway():
    """Crée l'API Gateway pour exposer l'agent"""
    apigateway = boto3.client('apigateway')
    lambda_client = boto3.client('lambda')
    
    try:
        # Créer l'API REST
        api_response = apigateway.create_rest_api(
            name='bedrock-agent-api',
            description='API pour Bedrock Agent'
        )
        api_id = api_response['id']
        
        # Obtenir la ressource racine
        resources = apigateway.get_resources(restApiId=api_id)
        root_id = resources['items'][0]['id']
        
        # Créer la ressource /chat
        resource_response = apigateway.create_resource(
            restApiId=api_id,
            parentId=root_id,
            pathPart='chat'
        )
        resource_id = resource_response['id']
        
        # Créer la méthode POST
        apigateway.put_method(
            restApiId=api_id,
            resourceId=resource_id,
            httpMethod='POST',
            authorizationType='NONE'
        )
        
        # Intégration avec Lambda
        lambda_arn = f"arn:aws:lambda:{boto3.Session().region_name}:{boto3.client('sts').get_caller_identity()['Account']}:function:bedrock-agent"
        
        apigateway.put_integration(
            restApiId=api_id,
            resourceId=resource_id,
            httpMethod='POST',
            type='AWS_PROXY',
            integrationHttpMethod='POST',
            uri=f"arn:aws:apigateway:{boto3.Session().region_name}:lambda:path/2015-03-31/functions/{lambda_arn}/invocations"
        )
        
        # Déployer l'API
        apigateway.create_deployment(
            restApiId=api_id,
            stageName='prod'
        )
        
        # Donner permission à API Gateway d'invoquer Lambda
        lambda_client.add_permission(
            FunctionName='bedrock-agent',
            StatementId='api-gateway-invoke',
            Action='lambda:InvokeFunction',
            Principal='apigateway.amazonaws.com',
            SourceArn=f"arn:aws:execute-api:{boto3.Session().region_name}:{boto3.client('sts').get_caller_identity()['Account']}:{api_id}/*/*"
        )
        
        endpoint = f"https://{api_id}.execute-api.{boto3.Session().region_name}.amazonaws.com/prod/chat"
        print(f"API Gateway créé: {endpoint}")
        return endpoint
        
    except Exception as e:
        print(f"Erreur lors de la création de l'API Gateway: {e}")

def deploy_agent():
    """Déploie l'agent complet"""
    print("Déploiement de l'agent Bedrock...")
    
    # 1. Créer le package
    create_lambda_package()
    
    # 2. Déployer Lambda
    deploy_lambda_function()
    
    # 3. Créer API Gateway
    endpoint = create_api_gateway()
    
    print(f"\n✅ Agent déployé avec succès!")
    print(f"Endpoint: {endpoint}")
    print(f"Test avec: curl -X POST {endpoint} -H 'Content-Type: application/json' -d '{{\"prompt\":\"Bonjour\"}}'")

if __name__ == "__main__":
    deploy_agent()