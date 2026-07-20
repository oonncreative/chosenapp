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
}

struct ChosenProvider: TimelineProvider {
    func placeholder(in context: Context) -> ChosenEntry {
        ChosenEntry(date: Date(), texto: "Uma palavra para agora.", referencia: "CHOSEN")
    }

    func getSnapshot(in context: Context, completion: @escaping (ChosenEntry) -> Void) {
        completion(ChosenEntry(date: Date(), texto: "Uma palavra para agora.", referencia: "CHOSEN"))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<ChosenEntry>) -> Void) {
        fetchMessages { messages in
            let now = Date()
            var entries: [ChosenEntry] = []

            if messages.isEmpty {
                entries.append(ChosenEntry(date: now, texto: "Uma palavra para agora.", referencia: "CHOSEN"))
            } else {
                for (index, message) in messages.enumerated() {
                    let entryDate = Calendar.current.date(byAdding: .hour, value: index * 4, to: now) ?? now
                    entries.append(ChosenEntry(date: entryDate, texto: message.texto, referencia: message.referencia))
                }
            }

            let nextRefresh = Calendar.current.date(byAdding: .hour, value: 1, to: now) ?? now
            completion(Timeline(entries: entries, policy: .after(nextRefresh)))
        }
    }

    private func fetchMessages(completion: @escaping ([ChosenMessage]) -> Void) {
        guard let url = URL(string: "https://chosen.oonn.com.br/api/public/widget-messages") else {
            completion([])
            return
        }
        URLSession.shared.dataTask(with: url) { data, _, error in
            guard let data = data, error == nil else {
                completion([])
                return
            }
            do {
                let decoded = try JSONDecoder().decode(ChosenMessagesResponse.self, from: data)
                completion(decoded.mensagens)
            } catch {
                completion([])
            }
        }.resume()
    }
}

struct ChosenWidgetEntryView: View {
    var entry: ChosenProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
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
                Text(entry.referencia)
                    .font(.system(size: 12))
                    .opacity(0.7)
            }
            .padding()
        }
    }
}

struct ChosenWidget: Widget {
    let kind: String = "ChosenWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: ChosenProvider()) { entry in
            ChosenWidgetEntryView(entry: entry)
                .containerBackground(.fill.tertiary, for: .widget)
        }
        .configurationDisplayName("CHOSEN")
        .description("Uma palavra bíblica para o seu dia.")
        .supportedFamilies([.accessoryRectangular, .accessoryCircular, .accessoryInline, .systemSmall])
    }
}
