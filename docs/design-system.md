# Design System

## Design Tokens

A interface deve seguir uma estética minimalista, técnica e sóbria.

Princípios:
- Light mode predominantemente neutro e monocromático.
- Dark mode com superfícies em preto/zinc e accent violeta/índigo.
- Evitar uso excessivo do accent.
- Verde é reservado principalmente para estados positivos/ativos.
- Bordas devem ser sutis.
- Contraste deve preservar boa legibilidade.
- Preferir tokens semânticos em vez de cores hardcoded nos componentes.

### Color Tokens

`surface` é um token semântico próprio do Developer OS, adicional ao conjunto
de superfícies mais comum em bibliotecas de componentes (`background` / `card` /
`popover`). Por não ser um token padrão, precisa ser definido explicitamente no
tema, e não apenas herdado de valores default.

Novos tokens semânticos só devem ser introduzidos quando existir uma necessidade
visual concreta. Componentes de bibliotecas externas devem ser adaptados aos
tokens já definidos aqui no momento da integração, em vez de expandir a paleta
para acomodar convenções de token próprias dessas bibliotecas.

#### Light

| Token | Valor sugerido | Uso |
|---|---|---|
| `background` | `#FAFAFA` | Fundo global |
| `foreground` | `#111315` | Texto principal |
| `surface` | `#FFFFFF` | Container principal |
| `card` | `#F7F7F8` | Cards e blocos secundários |
| `card-foreground` | `#17191C` | Texto em cards |
| `popover` | `#FFFFFF` | Superfícies flutuantes (dropdown, dialog, tooltip) |
| `popover-foreground` | `#17191C` | Texto em superfícies flutuantes |
| `muted` | `#F1F2F3` | Áreas discretas / item ativo |
| `muted-foreground` | `#62666D` | Texto secundário |
| `border` | `#E2E4E7` | Bordas |
| `input` | `#E2E4E7` | Inputs |
| `primary` | `#111315` | CTA principal |
| `primary-hover` | `#202328` | Hover do CTA |
| `primary-foreground` | `#FFFFFF` | Texto sobre CTA |
| `secondary` | `#F1F2F3` | Botões secundários |
| `secondary-foreground` | `#202328` | Texto secundário |
| `accent` | `#ECEEF1` | Hover / seleção discreta |
| `accent-foreground` | `#17191C` | Texto sobre accent |
| `success` | `#4DBE70` | Status positivo |
| `success-foreground` | `#111315` | Texto sobre success |
| `destructive` | `#C43D4F` | Erro / ação destrutiva |
| `destructive-foreground` | `#FFFFFF` | Texto sobre destructive |
| `ring` | `#8B8F97` | Focus ring |

#### Dark

| Token | Valor sugerido | Uso |
|---|---|---|
| `background` | `#090C11` | Fundo global |
| `foreground` | `#F4F4F5` | Texto principal |
| `surface` | `#0E1218` | Container principal |
| `card` | `#12171F` | Cards |
| `card-foreground` | `#F4F4F5` | Texto em cards |
| `popover` | `#12171F` | Superfícies flutuantes (dropdown, dialog, tooltip) |
| `popover-foreground` | `#F4F4F5` | Texto em superfícies flutuantes |
| `muted` | `#171C25` | Áreas discretas / item ativo |
| `muted-foreground` | `#9CA3AF` | Texto secundário |
| `border` | `#282E38` | Bordas |
| `input` | `#282E38` | Inputs |
| `primary` | `#7057E8` | CTA principal |
| `primary-hover` | `#8069F0` | Hover do CTA |
| `primary-foreground` | `#FFFFFF` | Texto sobre CTA |
| `secondary` | `#171C25` | Botões secundários |
| `secondary-foreground` | `#ECEEF2` | Texto secundário |
| `accent` | `#242B38` | Hover / seleção |
| `accent-foreground` | `#FFFFFF` | Texto sobre accent |
| `success` | `#4FD17A` | Status positivo |
| `success-foreground` | `#090C11` | Texto sobre success |
| `destructive` | `#CE4257` | Erro / ação destrutiva |
| `destructive-foreground` | `#FFFFFF` | Texto sobre destructive |
| `ring` | `#7764E8` | Focus ring |

### Typography Tokens

Fonte principal:

`Geist Variable, system-ui, sans-serif`

A tipografia deve transmitir clareza, precisão e uma estética
contemporânea relacionada a software e engenharia.

Geist como fonte principal do projeto. 'system-ui' e 'sans-serif' como fallback.

`Geist Variable` é o nome de família exposto pela distribuição adotada
(ver `conventions.md` §5). A versão variable cobre todos os pesos abaixo
em um único arquivo.

Tokens:

- `font-sans`
- `text-xs`: 12px
- `text-sm`: 14px
- `text-base`: 16px
- `text-lg`: 18px
- `text-xl`: 20px
- `text-2xl`: 24px
- `text-3xl`: 30px
- `text-4xl`: 36px
- `text-5xl`: 48px
- `text-6xl`: 56px

Pesos principais:
- `400`: texto comum
- `500`: labels, navegação e botões
- `600`: títulos de cards
- `700`: headings principais

O hero deve usar aproximadamente:
- desktop: `text-5xl` (48px) a `text-6xl` (56px)
- line-height: `1.05–1.1`
- font-weight: `700`

`text-6xl` está definido como 56px para cobrir o topo do hero. O valor diverge do
default mais comum para esse degrau (60px) e, assim como a escala de radius,
precisa ser configurado explicitamente no tema.

### Spacing Tokens

Usar uma escala consistente baseada em múltiplos de 4px:

`4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64`

A escala de spacing é fechada. Componentes devem utilizar apenas os valores definidos nesta escala. Valores fora dela só devem ser introduzidos quando houver necessidade visual concreta e, nesse caso, devem primeiro ser incorporados ao design system. Enforcement automatizado não será adotado inicialmente; a regra será mantida por convenção e code review.

### Radius Tokens

- `radius-sm`: `8px`
- `radius-md`: `12px`
- `radius-lg`: `16px`
- `radius-xl`: `20px`

Diretriz:
- botões: `radius-md` (12px)
- cards: `radius-lg` (16px)
- container principal: `radius-xl` (20px)

Evitar aparência excessivamente arredondada.

Esta escala é uma decisão do design system e não corresponde aos valores default
das escalas de radius mais comuns. Deve ser configurada explicitamente no tema,
em vez de depender integralmente dos defaults do framework de estilização.

### Shadow Tokens

As sombras devem ser discretas.

Light:
- cards: praticamente sem sombra
- container principal: sombra suave e difusa

Dark:
- priorizar contraste entre superfícies em vez de sombras
- evitar glow, exceto de forma extremamente sutil em elementos gráficos

### Component Semantics

#### Sidebar
- fundo integrado ao `background`
- item ativo usa `muted`
- texto ativo usa `foreground`
- itens inativos usam `muted-foreground`
- hover usa `accent`

#### Main container
- usa `surface`
- borda `border`
- radius `radius-xl`

#### Cards
- usam `card`
- borda `border`
- radius `radius-lg`
- sem sombras fortes

#### CTA principal

Light:
- background `primary`
- foreground `primary-foreground`

Dark:
- background violeta `primary`
- foreground branco
- accent não deve se espalhar para todos os componentes

#### Status
- `success` apenas para ativo/concluído/positivo
- `muted-foreground` para neutro/em planejamento
- `destructive` reservado para erro/destrutivo

### Visual Language

A interface deve transmitir:

- engenharia
- organização
- clareza
- experimentação
- IA sem estética cyberpunk
- sofisticação sem parecer uma landing page de startup genérica

Evitar:
- excesso de gradients
- excesso de neon
- glassmorphism pesado
- sombras fortes
- múltiplas cores de destaque concorrendo entre si
- bordas com alto contraste

### Theme Strategy

O tema deve ser implementado com CSS variables semânticas compatíveis
com Tailwind CSS e shadcn/ui.

Os componentes não devem saber se estão em light ou dark mode.

Exemplo:

`bg-background`
`text-foreground`
`bg-card`
`text-muted-foreground`
`border-border`
`bg-primary`
`text-primary-foreground`

Nunca usar diretamente algo como:

`bg-[#12171F]`

dentro de componentes comuns, salvo exceções justificadas.