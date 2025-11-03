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
            return f"Error: Unable to generate response - {str(e)}"

# Test de l'agent
ai_client = BedrockAIClient()
test_response = ai_client.generate_response('Bonjour tu vas bien ?')
print(f"Test response: {test_response}")