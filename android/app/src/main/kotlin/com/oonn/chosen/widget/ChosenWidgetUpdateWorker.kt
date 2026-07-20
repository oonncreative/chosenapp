package com.oonn.chosen.widget

import android.content.Context
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters

class ChosenWidgetUpdateWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        return try {
            val appWidgetId = inputData.getInt("appWidgetId", -1)
            if (appWidgetId == -1) return Result.failure()

            val glanceId = GlanceAppWidgetManager(applicationContext).getGlanceIdBy(appWidgetId)
            ChosenWidget().update(applicationContext, glanceId)

            android.util.Log.d("ChosenWidget", "Worker atualizou o widget com sucesso")
            Result.success()
        } catch (e: Exception) {
            android.util.Log.e("ChosenWidget", "Worker falhou ao atualizar", e)
            Result.failure()
        }
    }
}
