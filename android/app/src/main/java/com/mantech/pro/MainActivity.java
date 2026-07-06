package com.mantech.pro;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;
import com.google.firebase.FirebaseApp;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        try {
            FirebaseApp.initializeApp(this);
        } catch (Exception e) {
            // Silently fail if google-services.json is missing to prevent crash
            e.printStackTrace();
        }
    }
}
