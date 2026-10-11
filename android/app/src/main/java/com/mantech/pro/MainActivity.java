package com.mantech.pro;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.ImageView;
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
            e.printStackTrace();
        }

        // Portada de bienvenida a pantalla completa (Full-Screen Welcome Cover)
        final ViewGroup rootView = findViewById(android.R.id.content);
        if (rootView != null) {
            final ImageView welcomeCover = new ImageView(this);
            welcomeCover.setImageResource(R.drawable.splash);
            welcomeCover.setScaleType(ImageView.ScaleType.CENTER_CROP);
            welcomeCover.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));
            welcomeCover.setClickable(true);
            rootView.addView(welcomeCover);

            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                welcomeCover.animate()
                    .alpha(0f)
                    .setDuration(450)
                    .withEndAction(() -> rootView.removeView(welcomeCover))
                    .start();
            }, 2500);
        }
    }
}
