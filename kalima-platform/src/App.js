import React from 'react';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import Home from './pages/Home';

function App() {
  return (
    <IonApp>
      <IonReactRouter>
        {/* IonRouterOutlet provides the animation and view management */}
        <IonRouterOutlet>
          <Route path="/" component={Home} exact={true} />
          {/* Redirect from root URL to /home */}
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
