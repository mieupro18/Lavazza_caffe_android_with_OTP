package com.lavazza;

import android.widget.Toast;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import android.net.wifi.WifiManager;
import android.net.wifi.WifiInfo;
import android.net.DhcpInfo;
import android.content.Context;
import java.util.List;
import android.net.wifi.WifiConfiguration;
import android.net.wifi.WifiNetworkSuggestion;
//import android.net.wifi.WifiNetworkSuggestion.Builder;

import android.os.Build;
import android.provider.Settings;
import android.content.Intent;
import java.util.Map;
import java.util.Locale.Category;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Formatter;
import java.util.concurrent.TimeUnit;

public class TestWifiModule extends ReactContextBaseJavaModule {
  ReactApplicationContext reactContext;
  WifiManager wifi;

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";
  private static final String PREDEFINEDSSID = "MyPiAP";
  private static final String PREDEFINEDPASSWORD = "raspberry";

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
  
  //Method to turn on wifi service
  @ReactMethod
  public void turnOnWifi(Promise promise){
    try{
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        Intent intent = new Intent(WifiManager.ACTION_PICK_WIFI_NETWORK);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent); 
        promise.resolve(true);
      }else{
        wifi.setWifiEnabled(true);
        TimeUnit.SECONDS.sleep(2);
        Boolean Enabled = wifi.isWifiEnabled();
        if (Enabled){
          promise.resolve(true);
        }else{
          throw new Exception("wifi not enabled");
        }
      }
    }catch(Exception e){
      promise.reject(e);
    }
  }

  //Method to turn off wifi service
  @ReactMethod
  public void turnOffWifi(Promise promise){
    try {
      wifi.setWifiEnabled(false);
      promise.resolve(true);
    } catch (Exception e) {
      promise.reject(e);
    }
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

  //add configuration of hidden network and return it's networkId
  @ReactMethod
	public void connectToCoffeeMachine(Promise promise) {
    try{
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        promise.resolve(false);
        /*final WifiNetworkSuggestion lavazza_Network =
        new Builder()
        .setSsid(ssid)
        .setWpa2Passphrase(sharedKey)
        .setIsHiddenSsid(true)
        .build();

        final List<WifiNetworkSuggestion> suggestionsList =
        new ArrayList<WifiNetworkSuggestion>( );
        
        suggestionsList.add(lavazza_Network);
        wifi.addNetworkSuggestions(suggestionsList);*/
      }
      else{
        int netId = -1;
        List<WifiConfiguration> list = wifi.getConfiguredNetworks();
        for( WifiConfiguration i : list ) {
          String ssid = i.SSID.replace("SSID: ","").replaceAll("\"","");
          if (PREDEFINEDSSID.equals(ssid)){
            wifi.removeNetwork(i.networkId);
            wifi.saveConfiguration(); 
          } 
        }
        WifiConfiguration conf = new WifiConfiguration();

        conf.SSID = "\"" + PREDEFINEDSSID + "\"";
        conf.preSharedKey = "\"" + PREDEFINEDPASSWORD + "\"";
    
        conf.hiddenSSID = true;
        conf.status = WifiConfiguration.Status.ENABLED;
        conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP);
        conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP);
        conf.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK);
        conf.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP);
        conf.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP);
        conf.allowedProtocols.set(WifiConfiguration.Protocol.RSN);
        conf.allowedProtocols.set(WifiConfiguration.Protocol.WPA);
      
        netId = wifi.addNetwork(conf);
        wifi.saveConfiguration();

        List<WifiConfiguration> list1 = wifi.getConfiguredNetworks();
        for( WifiConfiguration i : list1 ) {
          if(i.SSID != null && i.SSID.equals("\"" + PREDEFINEDSSID + "\"")) {
            wifi.disconnect();
            wifi.enableNetwork(i.networkId, true);
            wifi.reconnect();               
            break;
          }           
        }
        promise.resolve(netId);
      }
    }catch(Exception e){
        promise.reject(e);
    }
  }

  @ReactMethod
  public void isConnectedToGivenSSID(Promise promise) {
    try{
      WifiInfo wifiInfo = wifi.getConnectionInfo();
      String ssid = wifiInfo.getSSID().replace("SSID: ","").replaceAll("\"","");
      if(PREDEFINEDSSID.equals(ssid)){
        promise.resolve(true);
      }
      else{
        promise.resolve(false);
      }
    }catch(Exception e){
      promise.reject(e);
    }
  }
  @ReactMethod
  public void forgetNetwork(Promise promise) {
    try {
      List<WifiConfiguration> list = wifi.getConfiguredNetworks();
      for( WifiConfiguration i : list ) {
        String ssid = i.SSID.replace("SSID: ","").replaceAll("\"","");
        if (PREDEFINEDSSID.equals(ssid)){
          wifi.removeNetwork(i.networkId);
          wifi.saveConfiguration(); 
        } 
      }
      promise.resolve(true);
    } catch (Exception e) {
      promise.reject(e);
    }
    
  }
  @ReactMethod
  public void getDefaultGatewayIp(Promise promise) {
    try{
      final DhcpInfo dhcp = wifi.getDhcpInfo();
      promise.resolve(dhcp.gateway);
    }catch(Exception e){
      promise.reject(e);
    }
  }

  @ReactMethod
  public void show(String message, int duration) {
    Toast.makeText(getReactApplicationContext(), message, duration).show();
  }


  /*@ReactMethod
  public void turnOffWifi(Promise promise){
    try{
      wifi.setWifiEnabled(false);
      promise.resolve(true);
    }catch(Exception error){
      promise.reject(error);
    }
  }*/
	
  //add configuration of hidden network and return it's networkId
  /*@ReactMethod
	public void connectToCoffeeMachine(Promise promise) {
    try{
      if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
        WifiConfiguration conf = new WifiConfiguration();

        conf.SSID = "\"" + PREDEFINEDSSID + "\"";
        conf.preSharedKey = "\"" + PREDEFINEDPASSWORD + "\"";
    
        conf.hiddenSSID = true;
        conf.status = WifiConfiguration.Status.ENABLED;
        conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.TKIP);
        conf.allowedGroupCiphers.set(WifiConfiguration.GroupCipher.CCMP);
        conf.allowedKeyManagement.set(WifiConfiguration.KeyMgmt.WPA_PSK);
        conf.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.TKIP);
        conf.allowedPairwiseCiphers.set(WifiConfiguration.PairwiseCipher.CCMP);
        conf.allowedProtocols.set(WifiConfiguration.Protocol.RSN);
        conf.allowedProtocols.set(WifiConfiguration.Protocol.WPA);
      
        int updateNetwork = -1;

        updateNetwork = wifi.addNetwork(conf);
        wifi.saveConfiguration();
        
        // enable new network
        boolean enableNetwork = wifi.enableNetwork(updateNetwork, true);
        promise.resolve(true);
      }
      else{
        promise.resolve(false);
        /*final WifiNetworkSuggestion lavazza_Network =
        new Builder()
        .setSsid(ssid)
        .setWpa2Passphrase(sharedKey)
        .setIsHiddenSsid(true)
        .build();

        final List<WifiNetworkSuggestion> suggestionsList =
        new ArrayList<WifiNetworkSuggestion>( );
        
        suggestionsList.add(lavazza_Network);
        wifi.addNetworkSuggestions(suggestionsList);*/
    //}
    //}catch(Exception e){
     //   promise.reject(e);
   // }
  //}
  
  /*@ReactMethod
  public void isConnectedToGivenSSID(Promise promise) {
    
    //Intent intent = new Intent(WifiManager.EXTRA_NETWORK_INFO);
    //NetworkInfo info = intent.getParcelableExtra(WifiManager.EXTRA_NETWORK_INFO);
    //if (info.isConnected()){
    try{
      WifiInfo wifiInfo = wifi.getConnectionInfo();
      String ssid = wifiInfo.getSSID().replace("SSID: ","").replaceAll("\"","");
      if(PREDEFINEDSSID.equals(ssid)){
        promise.resolve(true);
      }
      else{
        promise.resolve(false);
      }
    }catch(Exception e){
      promise.resolve(e);
    }
      //String ssid = wifiInfo.getSSID();
      //promise.resolve(wifiInfo.getSSID());
    //}
    //else{
     // promise.resolve(false);
   // }
  }*/


 /* @ReactMethod
  public void getDefaultGatewayIp(Promise promise) {
    try{
      final DhcpInfo dhcp = wifi.getDhcpInfo();
      //final String address = Formatter.formatIpAddress(dhcp.gateway);
      promise.resolve(dhcp.gateway);
    }catch(Exception e){
      promise.resolve(e);
    }
  }

  @ReactMethod
  public void show(String message, int duration) {
    Toast.makeText(getReactApplicationContext(), message, duration).show();
  }

  // //Method to check if wifi is enabled
	// @ReactMethod
	// public void isEnabled(Callback isEnabled) {
	// 	isEnabled.invoke(wifi.isWifiEnabled());
	// }*/

  /*//Method to connect/disconnect wifi service
	@ReactMethod
	public void setEnabled(Boolean enabled,Promise promise) {
    //String message = "hi";
    //int duration = 5;
    //Toast.makeText(getReactApplicationContext(), message, duration).show();

    if(enabled==true){

      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        Intent intent = new Intent(WifiManager.ACTION_PICK_WIFI_NETWORK);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent); 
        //promise.resolve(false);
      }
      else{
        wifi.setWifiEnabled(enabled);
        promise.resolve(true);
      }
    }
		else{
      wifi.setWifiEnabled(enabled);
    }
  }*/
  //List<Integer> list=new ArrayList<Integer>();  
        // enable new network
        /*WifiInfo wifi_inf = wifi.getConnectionInfo();
        int currentNetId = wifi_inf.getNetworkId();
        if(currentNetId != -1){
          //wifi.disableNetwork(currentNetId);
          
        }*/

}