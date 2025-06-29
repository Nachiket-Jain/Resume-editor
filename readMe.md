## ⚙️ Setup Instructions

To get this project up and running on your local machine, follow these steps.

---

### Backend Setup

First, let's get the backend configured:

1.  **Navigate to the backend directory**:
    ```bash
    cd resume-editor-backend
    ```
    (Ensure you are in the `resume-editor-backend` directory.)

2.  **Install the required Python dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Start the backend server**:
    ```bash
    python main.py
    ```

---

### Frontend Setup

Next, set up the frontend components:

1.  **Navigate to the frontend directory**:
    ```bash
    cd resume-editor-frontend
    ```
    (Ensure you are in the `resume-editor-frontend` directory.)

2.  **Install the necessary dependencies**, including `lucide-react` and Tailwind CSS:
    ```bash
    npm install lucide-react
    npm install -D tailwindcss postcss autoprefixer
    ```

3.  **Initialize Tailwind CSS**:
    ```bash
    npx tailwindcss init -p
    ```

4.  **Launch the frontend application**:
    ```bash
    npm start
    ```

---

The frontend application will typically be accessible in your web browser at:
**[http://localhost:3000](http://localhost:3000)**