package com.oonn.chosen.widget

import android.content.Context
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.currentState
import androidx.glance.layout.Column
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.state.GlanceStateDefinition
import androidx.glance.state.PreferencesGlanceStateDefinition
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.unit.ColorProvider
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Color
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URL

@Serializable
data class ChosenMessage(val texto: String, val referencia: String, val resumo: String? = null)

@Serializable
data class ChosenMessagesResponse(val mensagens: List<ChosenMessage>)

val KEY_BACKGROUND = stringPreferencesKey("chosen_widget_background")
val KEY_CONTENT_TYPE = stringPreferencesKey("chosen_widget_content_type")

class ChosenWidget : GlanceAppWidget() {

    override val stateDefinition: GlanceStateDefinition<*> = PreferencesGlanceStateDefinition

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prefs = androidx.glance.appwidget.state.getAppWidgetState(context, PreferencesGlanceStateDefinition, id)
        val background = prefs[KEY_BACKGROUND] ?: "padrao"
        val contentType = prefs[KEY_CONTENT_TYPE] ?: "misto"

        val message = fetchMessage(contentType)

        provideContent {
            WidgetContent(message = message, background = background)
        }
    }

    private suspend fun fetchMessage(contentType: String): ChosenMessage {
        return try {
            var urlString = "https://chosen.oonn.com.br/api/public/widget-messages"
            if (contentType != "misto") {
                urlString += "?tipo=$contentType"
            }
            val connection = URL(urlString).openConnection() as HttpURLConnection
            connection.connectTimeout = 8000
            connection.readTimeout = 8000
            val body = connection.inputStream.bufferedReader().use { it.readText() }
            val decoded = Json { ignoreUnknownKeys = true }.decodeFromString<ChosenMessagesResponse>(body)
            decoded.mensagens.firstOrNull() ?: fallbackMessage()
        } catch (e: Exception) {
            fallbackMessage()
        }
    }

    private fun fallbackMessage() = ChosenMessage(
        texto = "Uma palavra para agora.",
        referencia = "CHOSEN"
    )
}

@androidx.compose.runtime.Composable
private fun WidgetContent(message: ChosenMessage, background: String) {
    val bgColor = when (background) {
        "amarelo" -> Color(0xFFF7EE6B)
        "branco" -> Color(0xFFFFFFFF)
        else -> Color(0xFFF2F2F2)
    }
    val textColor = when (background) {
        "amarelo", "branco" -> Color(0xFF000000)
        else -> Color(0xFF1A1A1A)
    }

    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(bgColor)
            .padding(16.dp)
    ) {
        Text(
            text = message.texto,
            style = TextStyle(fontSize = 15.sp, fontWeight = FontWeight.Medium, color = ColorProvider(textColor))
        )
        Spacer(modifier = GlanceModifier.height(8.dp))
        Text(
            text = message.referencia,
            style = TextStyle(fontSize = 12.sp, color = ColorProvider(textColor))
        )
    }
}

class ChosenWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = ChosenWidget()
}
