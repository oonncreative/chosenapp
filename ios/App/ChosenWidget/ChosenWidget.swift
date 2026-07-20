import WidgetKit
import SwiftUI

struct ChosenMessage: Codable {
    let texto: String
    let referencia: String
}

struct ChosenMessagesResponse: Codable {
    let mensagens: [ChosenMessage]
}

struct ChosenEntry: TimelineEntry {
    let date: Date
    let texto: String
    let referencia: String
    let background: ChosenWidgetBackground
}

struct ChosenProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> ChosenEntry {
        ChosenEntry(date: Date(), texto: "Uma palavra para agora.", referencia: "CHOSEN", background: .padrao)
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> ChosenEntry {
        ChosenEntry(date: Date(), texto: "Uma palavra para agora.", referencia: "CHOSEN", background: configuration.background)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<ChosenEntry> {
        let messages = await fetchMessages(tipo: configuration.contentType)
        let now = Date()
        var entries: [ChosenEntry] = []

        if messages.isEmpty {
            entries.append(ChosenEntry(date: now, texto: "Uma palavra para agora.", referencia: "CHOSEN", background: configuration.background))
        } else {
            for (index, message) in messages.enumerated() {
                let entryDate = Calendar.current.date(byAdding: .hour, value: index * 4, to: now) ?? now
                entries.append(ChosenEntry(date: entryDate, texto: message.texto, referencia: message.referencia, background: configuration.background))
            }
        }

        let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: now) ?? now
        return Timeline(entries: entries, policy: .after(nextRefresh))
    }

    private func fetchMessages(tipo: ChosenWidgetContentType) async -> [ChosenMessage] {
        var urlString = "https://chosen.oonn.com.br/api/public/widget-messages"
        if tipo != .misto {
            urlString += "?tipo=\(tipo.rawValue)"
        }
        guard let url = URL(string: urlString) else {
            return []
        }
        do {
            let (data, _) = try await URLSession.shared.data(from: url)
            let decoded = try JSONDecoder().decode(ChosenMessagesResponse.self, from: data)
            return decoded.mensagens
        } catch {
            return []
        }
    }
}

struct ChosenWidgetEntryView: View {
    var entry: ChosenProvider.Entry
    @Environment(\.widgetFamily) var family

    private var backgroundColor: Color {
        switch entry.background {
        case .padrao: return Color(.systemGray6)
        case .amarelo: return Color(red: 0.97, green: 0.93, blue: 0.42)
        case .branco: return .white
        }
    }

    private var textColor: Color {
        switch entry.background {
        case .padrao: return .primary
        case .amarelo, .branco: return .black
        }
    }

    var body: some View {
        content
            .containerBackground(backgroundColor, for: .widget)
    }

    @ViewBuilder
    private var content: some View {
        switch family {
        case .accessoryRectangular:
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.texto)
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(3)
                Text(entry.referencia)
                    .font(.system(size: 11))
                    .opacity(0.7)
            }
        case .accessoryInline:
            Text(entry.texto)
        case .accessoryCircular:
            VStack {
                Image(systemName: "book.fill")
                Text(entry.referencia)
                    .font(.system(size: 9))
            }
        default:
            VStack(alignment: .leading, spacing: 4) {
                Text(entry.texto)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(textColor)
                Text(entry.referencia)
                    .font(.system(size: 12))
                    .foregroundStyle(textColor.opacity(0.7))
            }
            .padding()
        }
    }
}

struct ChosenWidget: Widget {
    let kind: String = "ChosenWidget"

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: ConfigurationAppIntent.self, provider: ChosenProvider()) { entry in
            ChosenWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("CHOSEN")
        .description("Uma palavra bíblica para o seu dia.")
        .supportedFamilies([.accessoryRectangular, .accessoryCircular, .accessoryInline, .systemSmall])
    }
}
