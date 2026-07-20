import WidgetKit
import AppIntents

enum ChosenWidgetBackground: String, AppEnum {
    case padrao
    case amarelo
    case branco

    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Fundo do Widget"

    static var caseDisplayRepresentations: [ChosenWidgetBackground: DisplayRepresentation] = [
        .padrao: "Padrão",
        .amarelo: "Amarelo",
        .branco: "Branco"
    ]
}

struct ConfigurationAppIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "CHOSEN"
    static var description = IntentDescription("Escolha o visual do widget CHOSEN.")

    @Parameter(title: "Fundo", default: .padrao)
    var background: ChosenWidgetBackground
}
