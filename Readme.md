**Project Documentation (How To Guide )**

1- clone or pull latest update from the repository
2- open the project in your prefered IDE
3- cd kalima-platform
4- npm install
5- npm start for default website development.
6- npm run build for production

**Testing for android**
1- Download Android Studio and install
2- Download Java JDK 21 from oracle.com
3- Configure environment variables for %ANDROID_HOME% and %JAVA_HOME%
4- npm run build.
5- npx cap sync.
6- npx cap run android.
**How to configure environment variables**
1- After installing Android Studio, go to search bar and type "environment variables".
2- Click on "Edit the system environment variables"
3- Click on "Environment Variables"
4- Click on "New"
5- Type "ANDROID_HOME" in the "Variable name" field and "C:\Users\<username>\AppData\Local\Android\Sdk" in the "Variable value" field with username being your device username.
6- Click on "New"
7- Type "JAVA_HOME" in the "Variable name" field and "C:\Program Files\Java\jdk-21" in the "Variable value" field.
8- Click on "OK"
9- restart your IDE and terminal.
10- in cmd prompt or powershell as admin, run the following commands : <br>
    - setx JAVA_HOME "C:\Program Files\Java\jdk-17" <br>
    - setx PATH "%PATH%;%JAVA_HOME%\bin" <br>
10- to verify, open cmd prompt as administrator and type echo %ANDROID_HOME% and echo %JAVA_HOME% and it should show you the locations of both the variables.
