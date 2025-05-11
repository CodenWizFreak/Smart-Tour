# 🌍 Smart Tour: AI-Powered Indian Travel Recommendation App

An intelligent travel companion that suggests personalized Indian destinations using the power of AI and real-time data. Explore India like never before!

## 🌟 Features

- **AI-Powered Recommendations:** Personalized travel suggestions based on user input (place type, budget, season, source) using Gemini API.
- **Live Data Fetching:** Dynamic destination info retrieved using the Gemini API for up-to-date travel details.
- **Geolocation Support:** Precise coordinates for recommended locations fetched using the OpenCage API.
- **Interactive Map:** Leaflet.js map featuring custom, colored markers categorized by state for easy visualization.
- **Structured Output:** Clean and organized presentation of travel information, including highlights, attractions, budget, season, and travel details.
- **Fallback Handling:**  Intelligent fallback system that displays default destinations if AI extraction encounters issues.
- **Mobile-Friendly UI:**  Responsive map and design, ensuring a seamless experience on various devices.

## 🛠️ Technologies Used

- **Frontend:**
    - **JavaScript:** Core programming language for interactivity.
    - **TypeScript:** Enhances code maintainability and scalability.
    - **Next.js:** React framework for server-side rendering and improved performance.
    - **Material UI:**  Provides a rich set of UI components for a polished user experience.
- **Backend:**
    - **Express:** Lightweight and flexible Node.js web application framework.
- **Other Technologies:**
    - **Gemini API:** Powers the AI-driven travel recommendations.
    - **OpenCage Forward Geocoder:** Provides geographical coordinates for locations.
    - **Leaflet.js:**  Interactive map library for visualizing destinations.
 
## ⚙️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/CodenWizFreak/Smart-Tour.git
   ```

2. Navigate to the project directory:
   ```bash
   cd Smart-Tour
   ```

3. Install dependencies:
   ```bash
   npm install  # For the frontend (Next.js)
   cd backend
   npm install  # For the backend (Express)
   cd ..
   ```

4. Configure API keys:

   - Obtain API keys for Gemini and OpenCage Forward Geocoder.
   - Create a `.env.local` file in the root directory of the project and add your API keys:

     ```
     GEMINI_API_KEY=YOUR_GEMINI_API_KEY
     OPENCAGE_API_KEY=YOUR_OPENCAGE_API_KEY
     ```

   - Create a `.env` file in the `backend` directory:
    ```
    OPENCAGE_API_KEY=YOUR_OPENCAGE_API_KEY
    GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```
5. Run the application:

   - Start the backend server:
     ```bash
     cd backend
     npm run start
     ```

   - Start the frontend development server:
     ```bash
     cd ..
     npm run dev
     ```

     (This will typically start the frontend on `http://localhost:3000`)

## 📸 Screenshots
![logo-text](https://github.com/user-attachments/assets/9142a0e1-2aa3-460d-a23f-4b2080c157f7)

![logo-compass](https://github.com/user-attachments/assets/234a3e05-9bae-4065-97f4-dc0c301a5466)


## 🚀 How to Use

1.  Launch the application in your web browser.
2.  Enter your travel preferences (place type, budget, season, source) in the input fields.
3.  Click the "Get Recommendations" button.
4.  Explore the recommended destinations on the interactive map, complete with state-based colored markers and detailed travel information.
5.  Interact with map markers to view specific travel details and insights.

## 🤝 Contribution

Feel free to fork this repository, raise issues, or submit pull requests to add features, improve the design, or enhance the functionality.  All contributions are welcome!

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
