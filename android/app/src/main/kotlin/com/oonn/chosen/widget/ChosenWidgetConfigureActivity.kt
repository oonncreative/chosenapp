package com.oonn.chosen.widget

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.selection.selectable
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.glance.appwidget.GlanceAppWidgetManager
import androidx.glance.appwidget.state.updateAppWidgetState
import androidx.glance.appwidget.updateAll
import kotlinx.coroutines.launch
import androidx.lifecycle.lifecycleScope
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.workDataOf

class ChosenWidgetConfigureActivity : ComponentActivity() {

    private var appWidgetId = AppWidgetManager.INVALID_APPWIDGET_ID

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setResult(Activity.RESULT_CANCELED)

        appWidgetId = intent?.extras?.getInt(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID

        if (appWidgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        setContent {
            MaterialTheme {
                ConfigureScreen(onConfirm = { background, contentType ->
                    saveAndFinish(background, contentType)
                })
            }
        }
    }

    private fun saveAndFinish(background: String, contentType: String) {
        lifecycleScope.launch {
            try {
                android.util.Log.d("ChosenWidget", "Salvando config: appWidgetId=$appWidgetId background=$background contentType=$contentType")

                val glanceId = GlanceAppWidgetManager(this@ChosenWidgetConfigureActivity)
                    .getGlanceIdBy(appWidgetId)

                android.util.Log.d("ChosenWidget", "glanceId encontrado: $glanceId")

                updateAppWidgetState(this@ChosenWidgetConfigureActivity, glanceId) { prefs ->
                    prefs[KEY_BACKGROUND] = background
                    prefs[KEY_CONTENT_TYPE] = contentType
                }

                android.util.Log.d("ChosenWidget", "Estado salvo, agendando atualização via WorkManager")

                val workRequest = OneTimeWorkRequestBuilder<ChosenWidgetUpdateWorker>()
                    .setInputData(workDataOf("appWidgetId" to appWidgetId))
                    .build()
                WorkManager.getInstance(applicationContext).enqueue(workRequest)

                android.util.Log.d("ChosenWidget", "Atualização agendada")

                val resultValue = Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId)
                setResult(Activity.RESULT_OK, resultValue)
            } catch (e: Exception) {
                android.util.Log.e("ChosenWidget", "Erro ao salvar configuração", e)
            } finally {
                finish()
            }
        }
    }
}

@Composable
private fun ConfigureScreen(onConfirm: (String, String) -> Unit) {
    var background by remember { mutableStateOf("padrao") }
    var contentType by remember { mutableStateOf("misto") }

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(modifier = Modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("CHOSEN", style = MaterialTheme.typography.headlineSmall)
            Text("Configure o widget", style = MaterialTheme.typography.bodyMedium)

            Text("Fundo", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 16.dp))
            RadioOption("Padrão", background == "padrao") { background = "padrao" }
            RadioOption("Amarelo", background == "amarelo") { background = "amarelo" }
            RadioOption("Branco", background == "branco") { background = "branco" }

            Text("Conteúdo", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 16.dp))
            RadioOption("Misto", contentType == "misto") { contentType = "misto" }
            RadioOption("Versículos", contentType == "versiculo") { contentType = "versiculo" }
            RadioOption("Orações", contentType == "oracao") { contentType = "oracao" }
            RadioOption("Motivacional", contentType == "motivacional") { contentType = "motivacional" }

            Button(
                onClick = { onConfirm(background, contentType) },
                modifier = Modifier.padding(top = 24.dp)
            ) {
                Text("Adicionar Widget")
            }
        }
    }
}

@Composable
private fun RadioOption(label: String, selected: Boolean, onSelect: () -> Unit) {
    Column(modifier = Modifier.selectable(selected = selected, onClick = onSelect)) {
        androidx.compose.foundation.layout.Row(
            verticalAlignment = androidx.compose.ui.Alignment.CenterVertically
        ) {
            RadioButton(selected = selected, onClick = onSelect)
            Text(label)
        }
    }
}
