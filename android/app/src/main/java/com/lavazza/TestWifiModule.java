package com.lavazza;

import android.widget.Toast;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.net.wifi.WifiManager;
import android.content.Context;
import android.provider.Settings;
import android.content.Intent;
import java.util.Map;
import java.util.Locale.Category;
import java.util.HashMap;

public class TestWifiModule extends ReactContextBaseJavaModule {
  ReactApplicationContext reactContext;
  WifiManager wifi;

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";

  public TestWifiModule(ReactApplicationContext reactContext) {
    super(reactContext);
    wifi = (WifiManager)reactContext.getSystemService(Context.WIFI_SERVICE);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "TestWifiModule";
  }
  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
    constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
    return constants;
  }
  
  // Method to find wifi enable status
  @ReactMethod
  public void isWifiTurnedOn(Promise promise){
    try {
      promise.resolve(wifi.isWifiEnabled());
    } catch (Exception e) {
      promise.reject(e);
    }
  }  
}