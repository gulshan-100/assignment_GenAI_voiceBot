from flask import Flask, request, jsonify, render_template
from langchain_openai import OpenAIEmbeddings, OpenAI
from langchain_community.vectorstores import FAISS
from langchain.chains import RetrievalQA
import openai
import os
import requests
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

# Initialize Flask app
app = Flask(__name__)

# Load environment variables
load_dotenv()

# Retrieve OpenAI API key from environment variables
openai_api_key = os.getenv("OPENAI_API_KEY")

# Update OpenAI API key usage
openai.api_key = openai_api_key

# Ensure FAISS index file is created and saved properly
# Generate embeddings and save the FAISS index if it doesn't exist
if not os.path.exists("portfolio_vectorstore/index.faiss"):
    print("FAISS index file not found. Creating a new index...")
    
    # Scrape portfolio content
    portfolio_url = "https://gulshan100.netlify.app/"
    response = requests.get(portfolio_url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Extract all text content from the site
    portfolio_content = soup.get_text(separator="\n")

    # Save the content to a file for preprocessing
    with open("portfolio_content.txt", "w", encoding="utf-8") as file:
        file.write(portfolio_content)

    # Preprocess scraped portfolio content into sections and save it back to portfolio_content.txt
    # Load the scraped portfolio content
    with open("portfolio_content.txt", "r", encoding="utf-8") as file:
        portfolio_content = file.read()

    # Remove excessive whitespace and normalize text
    portfolio_content = '\n'.join([line.strip() for line in portfolio_content.splitlines() if line.strip()])

    # Split the content into sections based on keywords
    sections = []
    current_section = []
    keywords = ["About Me", "Technical Skills", "Projects", "Experience", "Education", "Get in Touch"]

    for line in portfolio_content.splitlines():
        if any(keyword in line for keyword in keywords):
            if current_section:
                sections.append('\n'.join(current_section))
                current_section = []
            current_section.append(line)
        else:
            current_section.append(line)

    if current_section:
        sections.append('\n'.join(current_section))

    # Save the preprocessed content back to the file in sections
    with open("portfolio_content.txt", "w", encoding="utf-8") as file:
        file.write('\n\n'.join(sections))

    # Split the content into smaller chunks using RecursiveCharacterTextSplitter
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    texts = text_splitter.split_text('\n\n'.join(sections))

    # Generate embeddings for the chunks
    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
    vectorstore = FAISS.from_texts(texts, embeddings)

    # Save the vector database for later use
    vectorstore.save_local("portfolio_vectorstore")
    print("FAISS index file created and saved with preprocessed content in sections.")
else:
    # Load FAISS vector database
    embeddings = OpenAIEmbeddings(openai_api_key=openai_api_key)
    vectorstore = FAISS.load_local(
        "portfolio_vectorstore", 
        embeddings, 
        allow_dangerous_deserialization=True
    )

# Create a Retrieval-based QA chain
qa_chain = RetrievalQA.from_chain_type(
    llm=OpenAI(openai_api_key=openai_api_key),
    retriever=vectorstore.as_retriever()
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def query():
    user_query = request.json.get('query')
    if not user_query:
        return jsonify({"error": "No query provided"}), 400

    # Get response from LangChain
    response = qa_chain.run(user_query)
    return jsonify({"response": response})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to port 5000 if PORT is not set
    app.run(host="0.0.0.0", port=port, debug=True)