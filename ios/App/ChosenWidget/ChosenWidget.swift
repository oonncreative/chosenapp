import WidgetKit
import SwiftUI

struct ChosenMessage: Codable {
    let texto: String
    let referencia: String
    let resumo: String?
}

struct ChosenMessagesResponse: Codable {
    let mensagens: [ChosenMessage]
}

struct ChosenEntry: TimelineEntry {
    let date: Date
    let texto: String
    let referencia: String
    let resumo: String?
    let background: ChosenWidgetBackground
}

struct ChosenProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> ChosenEntry {
        ChosenEntry(date: Date(), texto: "Uma palavra para agora.", referencia: "CHOSEN", resumo: nil, background: .padrao)
    }

    func snapshot(for configuration: ConfigurationAppIntent, in context: Context) async -> ChosenEntry {
        ChosenEntry(date: Date(), texto: "Uma palavra para agora.", referencia: "CHOSEN", resumo: nil, background: configuration.background)
    }

    func timeline(for configuration: ConfigurationAppIntent, in context: Context) async -> Timeline<ChosenEntry> {
        let messages = await fetchMessages(tipo: configuration.contentType)
        let now = Date()
        var entries: [ChosenEntry] = []

        if messages.isEmpty {
            entries.append(ChosenEntry(date: now, texto: "Uma palavra para agora.", referencia: "CHOSEN", resumo: nil, background: configuration.background))
        } else {
            for (index, message) in messages.enumerated() {
                let entryDate = Calendar.current.date(byAdding: .hour, value: index * 4, to: now) ?? now
                entries.append(ChosenEntry(date: entryDate, texto: message.texto, referencia: message.referencia, resumo: message.resumo, background: configuration.background))
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

    private var textLineLimit: Int {
        switch family {
        case .systemMedium: return 4
        case .systemLarge: return 5
        default: return 3
        }
    }

    private var textFontSize: CGFloat {
        switch family {
        case .systemLarge: return 17
        case .systemMedium: return 15
        default: return 14
        }
    }

    private var resumoTruncado: String? {
        guard let resumo = entry.resumo, !resumo.isEmpty else { return nil }
        let limite = 280
        if resumo.count <= limite {
            return resumo
        }
        let indice = resumo.index(resumo.startIndex, offsetBy: limite)
        return String(resumo[..<indice]) + "..."
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
        case .systemSmall, .systemMedium, .systemLarge:
            VStack(alignment: .leading, spacing: 6) {
                Text(entry.texto)
                    .font(.system(size: textFontSize, weight: .medium))
                    .foregroundStyle(textColor)
                    .lineLimit(textLineLimit)
                    .fixedSize(horizontal: false, vertical: true)

                if family == .systemLarge, let resumo = resumoTruncado {
                    Text(resumo)
                        .font(.system(size: 12))
                        .foregroundStyle(textColor.opacity(0.8))
                        .lineLimit(8)
                }

                Spacer(minLength: 0)
                Text(entry.referencia)
                    .font(.system(size: 12))
                    .foregroundStyle(textColor.opacity(0.7))
            }
            .padding()
        default:
            EmptyView()
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
        .supportedFamilies([.accessoryRectangular, .accessoryCircular, .accessoryInline, .systemSmall, .systemMedium, .systemLarge])
    }
}
