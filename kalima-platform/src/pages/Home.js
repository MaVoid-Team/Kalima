import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';

const Home = () => (
  <IonPage className='bg-red-700'>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Home</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <h2>ALOOOOO</h2>
      <IonButton className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
      Tailwind Styled Ionic Button
    </IonButton>
    </IonContent>
  </IonPage>
);

export default Home;
