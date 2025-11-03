import boto3
import json

class BedrockAIClient:
    def __init__(self, model_id: str = "global.anthropic.claude-sonnet-4-5-20250929-v1:0"):
        self.bedrock_client = boto3.client('bedrock-runtime')
        self.model_id = model_id
        print(f"Using model: {self.model_id}")
    
    def generate_response(self, prompt: str, max_tokens: int = 10000) -> str:
        try:
            response = self.bedrock_client.invoke_model(
                modelId=self.model_id,
                messages=[{"role": "user", "content": [{"text": prompt}]}],
                inferenceConfig={
                    "temperature": 0.1,
                    "maxTokens": max_tokens
                }
            )
            
            return response["output"]["message"]["content"][0]["text"]
                
        except Exception as e:
            return f"Error: {str(e)}"

def deploy_simple_lambda():
    """Déploie une fonction Lambda simple sans créer de rôle"""
    lambda_client = boto3.client('lambda')
    
    # Code Lambda inline
    lambda_code = '''
import boto3
import json

def lambda_handler(event, context):
    bedrock_client = boto3.client('bedrock-runtime')
    
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
            'body': json.dumps({'response': result})
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
'''
    
    # Utiliser le rôle SageMaker existant
    sts = boto3.client('sts')
    current_role = sts.get_caller_identity()['Arn']
    role_arn = current_role.replace(':assumed-role/', ':role/').split('/')[0] + '/datazone_usr_role_alsdvbccweepsg_cr5d9nlcbub7o0'
    
    try:
        response = lambda_client.create_function(
            FunctionName='bedrock-simple-agent',
            Runtime='python3.11',
            Role=role_arn,
            Handler='index.lambda_handler',
            Code={'ZipFile': lambda_code.encode()},
            Description='Simple Bedrock Agent',
            Timeout=60,
            MemorySize=256
        )
        print(f"✅ Fonction Lambda créée: {response['FunctionArn']}")
        return response['FunctionArn']
        
    except lambda_client.exceptions.ResourceConflictException:
        lambda_client.update_function_code(
            FunctionName='bedrock-simple-agent',
            ZipFile=lambda_code.encode()
        )
        print("✅ Fonction Lambda mise à jour")
        return f"arn:aws:lambda:{boto3.Session().region_name}:{sts.get_caller_identity()['Account']}:function:bedrock-simple-agent"

def test_agent():
    """Test l'agent directement"""
    ai_client = BedrockAIClient()
    response = ai_client.generate_response('Bonjour, comment allez-vous ?')
    print(f"Test response: {response}")

if __name__ == "__main__":
    print("=== Test direct de l'agent ===")
    test_agent()
    
    print("\n=== Déploiement Lambda ===")
    function_arn = deploy_simple_lambda()
    
    print(f"\n✅ Agent déployé!")
    print(f"Pour tester: aws lambda invoke --function-name bedrock-simple-agent --payload '{{\"prompt\":\"Hello\"}}' response.json")