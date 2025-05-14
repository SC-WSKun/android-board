package com.anonymous.androidboard

import android.util.Log
import com.baidu.aip.asrwakeup3.core.util.AuthUtil
import com.baidu.aip.asrwakeup3.core.wakeup.MyWakeup
import com.baidu.aip.asrwakeup3.core.wakeup.listener.RecogWakeupListener
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.baidu.speech.asr.SpeechConstant

class WakeUpModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var myWakeup: MyWakeup? = null

    override fun getName(): String {
        return "WakeUpModule"
    }

    @ReactMethod
    fun startWakeUp() {
        Log.d("WakeUpModule", "startWakeUp called")

        if (myWakeup == null) {
            val listener = RecogWakeupListener { msg ->
                val result = msg.obj?.toString() ?: ""
                sendEvent("onWakeUpResult", result)
            }
            myWakeup = MyWakeup(reactContext, listener)
        }

        val params = AuthUtil.getParam()
        params[SpeechConstant.WP_WORDS_FILE] = "assets:///WakeUp.bin"
        myWakeup?.start(params)
    }

    @ReactMethod
    fun stopWakeUp() {
        myWakeup?.stop()
    }

    @ReactMethod
    fun release() {
        myWakeup?.release()
        myWakeup = null
    }

    private fun sendEvent(eventName: String, data: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }
}
