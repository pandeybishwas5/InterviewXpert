## 🎙️ InterviewXpert.AI

InterviewXpert AI is a web application that helps users improve their interview performance using artificial intelligence.
Users can upload audio or video recordings of their interviews, which are transcribed using Google Speech-to-Text and analyzed by an LLM (Large Language Model) to generate personalized feedback and improvement tips.

##  🚀 Features

* 🎧 Upload audio/video interview recordings

* ✍️ Automatic transcription using Google Speech-to-Text

* 🤖 AI-powered feedback generated from the transcript

* 📊 Dashboard to manage multiple interviews

* 🔄 Re-run transcription or feedback anytime

* 🧩 Modern UI with Tailwind + shadcn/ui components

* ⚙️ Modular frontend-backend architecture

## 🧠 Tech Stack

| Layer     | Technology                                      |
|-----------|-------------------------------------------------|
| Frontend  | React + TypeScript + Vite                       |
| UI Library| Tailwind CSS + shadcn/ui                        |
| Backend   | Django + Django REST Framework                  |
| AI/ML     | Google Cloud Speech-to-Text + OpenAI GPT        |
| Storage   | Google Cloud Storage                            |
| HTTP      | Axios (frontend) + Django REST API              |

## 📂 Project Structure
```
interview-coach-ai/
│
├── backend/
│   ├── manage.py
│   ├── interviews/
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── ...
│   └── settings.py
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── services/api.ts
│   │   └── components/
│   └── vite.config.ts
│
└── README.md
```

## ⚙️ Setup Instructions
1. Clone the repository
```
git clone https://github.com/pandeybishwas5/InterviewXpert.git
cd interview-coach-ai
```

## 🖥️ Backend Setup (Django)
2. Create and activate a virtual environment
```
cd backend
python -m venv venv
source venv/bin/activate   # on macOS/Linux
venv\Scripts\activate      # on Windows
```
3. Install dependencies
```
pip install -r requirements.txt
```
4. Add .env file (backend)
Your app requires a few environment variables for Google Cloud credentials and the OpenAI API key. These need to be set before running the project.

| Variable                          | Description                                      |
|----------------------------------|-------------------------------------------------|
| `GOOGLE_APPLICATION_CREDENTIALS_SPEECH` | Path to your Google Speech-to-Text JSON key file |
| `GOOGLE_APPLICATION_CREDENTIALS_GCS`    | Path to your Google Cloud Storage JSON key file  |
| `OPENAI_API_KEY`                  | Your OpenAI API key                              |
| `GCS_BUCKET`                     | Your Google Cloud Storage bucket name           |


Create a .env file inside your backend/ directory:
```
GOOGLE_APPLICATION_CREDENTIALS_SPEECH=backend/config/credentials/speech_service.json
GOOGLE_APPLICATION_CREDENTIALS_GCS=backend/config/credentials/gcs_credentials.json
OPENAI_API_KEY=your_openai_api_key_here
GCS_BUCKET=your_GCS_bucket_name

```

⚠️ Make sure you do not commit your credentials.
Add this line to your .gitignore:

credentials/

## 🔑 Adding Google Cloud Credentials
5. Get Google Cloud Speech-to-Text credentials

* Go to the Google Cloud Console

* Enable the Speech-to-Text API.

* Go to APIs & Services → Credentials → Create credentials → Service account key.

* Select:

  - Service account: Create new

  - Key type: JSON

* Download the JSON key file.

* Move it into your backend project under:

backend/config/credentials/speech_service.json

6. Setting Up Google Cloud Storage (GCS) for Your Project

### 1. Create a Service Account and Download JSON Credentials

Follow these steps to create a service account and download its JSON key file:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project or create a new one.
3. Navigate to **IAM & Admin > Service Accounts**.
4. Click **+ Create Service Account**.
5. Enter a name (e.g., `interview-coach-storage`) and click **Create**.
6. Assign the **Storage Admin** role to the service account for full bucket management (or **Storage Object Admin** for object-level access).
7. Click **Continue** and then **Done**.
8. Find your service account in the list, click the **three-dot menu (⋮)**, and select **Manage keys**.
9. Click **Add Key > Create new key**, choose **JSON**, and click **Create**.
10. Save the downloaded JSON file securely.
11. Move it into your backend project under: backend/config/credentials/gcs_credentials.json
12. Set the environment variable `GOOGLE_APPLICATION_CREDENTIALS_GCS` to point to this JSON file path.

---

### 2. Create a Google Cloud Storage Bucket

A bucket is where your app will store files like audio or transcripts.

1. In the Google Cloud Console, navigate to **Storage > Browser**.
2. Click **Create bucket**.
3. Enter a globally unique **bucket name** (e.g., `interview-coach-audio`).
4. Choose your desired **location** (region or multi-region).
5. Choose a **storage class** based on your needs (e.g., Standard).
6. Set access controls (usually **Uniform** is recommended).
7. Click **Create**.

---

### 3. Configure Your App to Use the Bucket

- Set the environment variable `GCS_BUCKET` to your bucket name (e.g., `interview-coach-audio`).
- Your app will use this bucket to upload and retrieve files.

---

> ⚠️ **Important:** Never commit your JSON credential files or API keys to your public repository. Keep them secure!



## 🧩 Frontend Setup (React + Vite)
7. Install dependencies
```
cd ../frontend
npm install
```

## 8. Run the frontend
```
npm run dev
```

## 🧪 Running the App

In two terminals:

Backend:
```
cd backend
python manage.py runserver
```

Frontend:
```
cd frontend
npm run dev
```

## Then open:
👉 http://localhost:5173

## 📡 API Endpoints

| Endpoint                               | Method | Description             |
|----------------------------------------|--------|-------------------------|
| `/api/interviews/`                     | GET    | List all interviews     |
| `/api/interviews/`                     | POST   | Create a new interview  |
| `/api/interviews/:id/upload/`          | POST   | Upload audio/video      |
| `/api/interviews/:id/transcribe/`      | POST   | Transcribe recording    |
| `/api/interviews/:id/feedback/`        | POST   | Get AI feedback         |
| `/api/interviews/:id/`                 | DELETE | Delete interview        |


## 🧰 Example Workflow

1. Create an interview (enter job title)

2. Upload your interview recording

3. Click Transcribe

4. Click Get Feedback

5. Review AI feedback and transcript in the workspace

## 🛡️ Security Notes

* Your Google Cloud JSON key should never be pushed to GitHub.

* Use .env files locally and environment variables in production.

* Add these lines to .gitignore:
```
.env
credentials/
__pycache__/
node_modules/
```

## ☁️ Deployment Notes

* Frontend can be deployed on Vercel, Netlify, or Firebase Hosting.

* Backend can be deployed on Render, Railway, or Google Cloud Run.

* Make sure environment variables are properly configured in production.

## 💬 Future Improvements

* Add authentication (login/register)

* Add AI-driven scoring system (e.g., 1–10 rating per question)

* Support multiple languages via Google Speech models

## 👨‍💻 Author

Bishwas Pandey
📧 pandeybishwas5@gmail.com
💼 [LinkedIn](https://www.linkedin.com/in/bishwaspandey/)
💻 [GitHub](https://github.com/pandeybishwas5)

