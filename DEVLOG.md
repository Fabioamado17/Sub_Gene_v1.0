# Dev Log — Gerador de Legendas

Documento que regista cada alteração ao frontend, explicando o que foi feito e porquê.

---

## Passo 1 — Limpar o boilerplate do Vite

**Data:** 2026-03-18

### O que é "boilerplate"?
Quando crias um projeto com `npm create vite`, ele gera código de demonstração para teres algo a ver no browser imediatamente. Esse código não tem utilidade para o nosso projeto e precisa de ser removido antes de começarmos a construir.

---

### Ficheiros alterados

#### `src/App.jsx` — Componente principal

**Antes:** Continha ~120 linhas com logos animados, um contador de cliques, links para documentação do Vite/React, e ícones SVG. Tudo código de demonstração.

**Depois:**
```jsx
function App() {
  return (
    <div>
      <h1>Gerador de Legendas</h1>
    </div>
  )
}

export default App
```

**Porquê?**
- `App` é o componente raiz da aplicação — é o primeiro a ser renderizado.
- Em React, um **componente** é uma função que retorna JSX (HTML dentro de JavaScript).
- A palavra `export default` no final torna o componente disponível para ser importado noutros ficheiros.
- Ficámos com o mínimo para confirmar que o projeto funciona antes de adicionar complexidade.

---

#### `src/App.css` — Estilos do App

**Antes:** Tinha ~185 linhas de CSS específico para o layout de demonstração (hero, contador, secções, etc.).

**Depois:** Ficheiro vazio.

**Porquê?**
- Todo o CSS estava ligado ao HTML que removemos. Manter estilos sem HTML correspondente seria código morto.
- Os estilos da nossa aplicação serão escritos do zero, apenas para o que precisamos.

---

#### `src/index.css` — Estilos globais

**Antes:** Definia variáveis de cor, tipografia, e o layout da página de demonstração do Vite (com bordas laterais, largura fixa de 1126px, etc.).

**Depois:**
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, sans-serif;
  background: #f5f5f5;
  color: #1a1a1a;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

#root {
  width: 100%;
  max-width: 600px;
  padding: 32px 16px;
}
```

**Porquê cada regra?**

| Regra | Explicação |
|---|---|
| `* { box-sizing: border-box }` | Por defeito, o CSS não inclui `padding` e `border` na largura de um elemento. Com `border-box`, a largura que defines É a largura total. Evita surpresas de layout. |
| `margin: 0; padding: 0` | Os browsers adicionam margens/paddings padrão aos elementos. Este "reset" remove-os para termos controlo total. |
| `body { display: flex; justify-content: center; align-items: center }` | Centra o conteúdo horizontal e verticalmente na página. |
| `#root { max-width: 600px }` | O `#root` é a `<div>` onde o React renderiza tudo. Limitamos a 600px para a interface não ficar demasiado larga em ecrãs grandes. |
| `min-height: 100vh` | `vh` = viewport height. Garante que o body ocupa pelo menos 100% da altura do ecrã, mesmo que o conteúdo seja pequeno. |

---

### Conceitos React introduzidos neste passo

**JSX** — É a sintaxe que parece HTML dentro do JavaScript. O Vite converte-a automaticamente para JavaScript puro. Por exemplo:
```jsx
<h1>Olá</h1>
// converte-se para:
React.createElement('h1', null, 'Olá')
```

**Componente** — Uma função JavaScript que retorna JSX. O nome tem de começar com maiúscula (`App`, não `app`), para o React distinguir componentes de elementos HTML normais.

**`index.css` vs `App.css`** — `index.css` aplica-se a toda a página (importado em `main.jsx`). `App.css` aplica-se apenas ao componente `App` (importado dentro de `App.jsx`). Esta separação ajuda a organizar estilos por componente.

---

## Próximo passo
**Passo 2 — Criar o componente de Upload** (`src/components/UploadArea.jsx`)

---

## Passo 2 — Componente de Upload

**Data:** 2026-03-18

### Ficheiros criados/alterados

#### `src/components/UploadArea.jsx` — Novo componente

Este componente é responsável por toda a interação de seleção de ficheiro: clique, drag & drop, validação e apresentação de erros.

**Código anotado:**

```jsx
import { useState, useRef } from 'react'
```
- `useState` — guarda valores que, quando mudam, fazem o componente re-renderizar (atualizar o ecrã).
- `useRef` — cria uma referência direta a um elemento do DOM (neste caso o `<input>`), sem causar re-render.

---

```jsx
function UploadArea({ onFileSelect }) {
```
- `{ onFileSelect }` é uma **prop** — um valor passado pelo componente pai (`App`).
- Props funcionam como argumentos de função: o pai passa dados/funções para o filho.
- Aqui, `onFileSelect` é uma função que o `UploadArea` chama quando o utilizador escolhe um ficheiro válido.

---

```jsx
const [dragging, setDragging] = useState(false)
const [selectedFile, setSelectedFile] = useState(null)
const [error, setError] = useState(null)
```
- Cada `useState` cria um par `[valor, setter]`.
- `dragging` — controla se o utilizador está a arrastar um ficheiro por cima da área (muda o estilo visual).
- `selectedFile` — guarda o ficheiro selecionado para mostrar o nome.
- `error` — guarda a mensagem de erro se o ficheiro não for `.mkv`.

---

```jsx
const inputRef = useRef(null)
```
- Cria uma referência ao `<input type="file">` escondido.
- Usamos isto para fazer `inputRef.current.click()` quando o utilizador clica na área — abre o seletor de ficheiros do sistema operativo.

---

```jsx
function validateAndSelect(file) {
  if (!file.name.toLowerCase().endsWith('.mkv')) {
    setError('Apenas ficheiros .mkv são suportados.')
    setSelectedFile(null)
    onFileSelect(null)
    return
  }
  setError(null)
  setSelectedFile(file)
  onFileSelect(file)
}
```
- Função reutilizada tanto pelo clique como pelo drag & drop — evita repetir lógica.
- `.toLowerCase()` — garante que `.MKV` ou `.Mkv` também são aceites.
- Se inválido: limpa o ficheiro e mostra erro. Se válido: limpa o erro e avisa o pai.

---

```jsx
function handleDrop(e) {
  e.preventDefault()
  ...
}
function handleDragOver(e) {
  e.preventDefault()
  ...
}
```
- `e.preventDefault()` — por defeito, o browser abre o ficheiro se o largares na página. Este comando cancela esse comportamento.

---

```jsx
<div
  className={`${styles.area} ${dragging ? styles.dragging : ''}`}
  onClick={() => inputRef.current.click()}
  ...
>
```
- Template literal (`` ` ` ``) para combinar duas classes CSS: `area` sempre presente, `dragging` só quando `dragging === true`.
- O `onClick` na `<div>` dispara o clique no `<input>` escondido.

---

```jsx
<input
  ref={inputRef}
  type="file"
  accept=".mkv"
  className={styles.hiddenInput}
  onChange={handleFileChange}
/>
```
- `ref={inputRef}` — liga o elemento ao `useRef` criado anteriormente.
- `accept=".mkv"` — o seletor de ficheiros do OS filtra por defeito para `.mkv` (mas não impede outros — por isso validamos manualmente).
- `display: none` no CSS esconde o input; clicamos nele programaticamente.

---

#### `src/components/UploadArea.module.css` — CSS Modules

Em vez de um ficheiro CSS global, usamos **CSS Modules** (o `.module.css` no nome).

**O que é um CSS Module?**
- As classes são automaticamente transformadas em nomes únicos (ex: `.area` torna-se `.UploadArea_area__x3k2`).
- Isto evita conflitos de nomes entre componentes diferentes.
- No JSX usamos `styles.area` em vez de `"area"`.

Classes importantes:
| Classe | Propósito |
|---|---|
| `.area` | Layout base da zona de drop — borda a tracejado, padding generoso |
| `.dragging` | Aplicada dinamicamente quando o utilizador arrasta; muda cor da borda e fundo |
| `.hiddenInput` | Esconde o `<input>` nativo mas mantém-no funcional |
| `.error` | Texto vermelho para mensagens de validação |

---

#### `src/App.jsx` — Atualizado

```jsx
import { useState } from 'react'
import UploadArea from './components/UploadArea'

function App() {
  const [file, setFile] = useState(null)

  return (
    <div>
      <h1>Gerador de Legendas</h1>
      <UploadArea onFileSelect={setFile} />
      {file && <p>Ficheiro pronto: {file.name}</p>}
    </div>
  )
}
```

- `App` guarda o ficheiro no seu próprio estado (`file`).
- Passa `setFile` como prop `onFileSelect` ao `UploadArea` — quando o filho seleciona um ficheiro, atualiza o estado do pai.
- `{file && <p>...</p>}` — renderização condicional: o `<p>` só aparece se `file` não for `null`. O `&&` funciona como "se X então mostra Y".

**Conceito: "lifting state up"**
O ficheiro poderia ser guardado dentro do `UploadArea`, mas no futuro o `App` precisará de o enviar ao backend. Por isso o estado "sobe" para o componente pai — padrão comum em React chamado *lifting state up*.

---

### Conceitos React introduzidos neste passo

| Conceito | Explicação curta |
|---|---|
| **Props** | Dados passados de pai para filho. Só fluem para baixo. |
| **useState** | Guarda valores reativos — quando mudam, o componente re-renderiza. |
| **useRef** | Referência direta a um elemento DOM, sem causar re-render. |
| **CSS Modules** | CSS com scope local ao componente, sem conflitos globais. |
| **Lifting state up** | Mover estado para o pai quando múltiplos filhos precisam dele. |
| **Renderização condicional** | `{condição && <JSX>}` — renderiza só se a condição for verdadeira. |

---

## Próximo passo
**Passo 3 — Enviar para o backend** (axios + FormData)

---

## Passo 3 — Enviar para o backend

**Data:** 2026-03-18

### Ficheiros criados/alterados

#### `src/services/api.js` — Novo ficheiro

Criámos uma pasta `services/` para separar a lógica de comunicação com o backend do código dos componentes. O ficheiro `api.js` é o único sítio da app que "sabe" como falar com o servidor.

```js
import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

export async function uploadMkv(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axios.post(`${BASE_URL}/upload`, formData, {
    responseType: 'blob',
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded / event.total) * 100)
        onProgress(percent)
      }
    },
  })

  return response.data
}
```

**Porquê `FormData`?**
Para enviar ficheiros via HTTP, não podemos usar JSON — o JSON só suporta texto. O `FormData` é o formato correto para uploads, equivalente ao que um `<form enctype="multipart/form-data">` enviaria num browser.
```js
const formData = new FormData()
formData.append('file', file)  // 'file' tem de coincidir com o nome no backend FastAPI
```

**`responseType: 'blob'`**
O backend devolve um ficheiro `.srt` (dados binários), não JSON. Ao definir `responseType: 'blob'`, dizemos ao axios para tratar a resposta como dados binários em vez de tentar fazer parse de texto.

**`onUploadProgress`**
O axios expõe um callback chamado durante o upload com um objeto `event`:
- `event.loaded` — bytes já enviados
- `event.total` — total de bytes a enviar
- Calculamos a percentagem e chamamos `onProgress(percent)` para atualizar o estado no `App`.

**`async/await`**
- `async function` — marca a função como assíncrona (pode ter operações que demoram, como pedidos de rede).
- `await` — pausa a execução até o pedido terminar, sem bloquear o browser.
- Sem `async/await`, teríamos de usar `.then().catch()` (Promises encadeadas) — mais verboso.

---

#### `src/App.jsx` — Atualizado

**Novos estados:**
```js
const [status, setStatus] = useState('idle')
const [uploadProgress, setUploadProgress] = useState(0)
const [error, setError] = useState(null)
```

| Estado | Valores possíveis | Propósito |
|---|---|---|
| `status` | `'idle'`, `'uploading'`, `'processing'`, `'done'` | Controla o que é mostrado na UI |
| `uploadProgress` | `0` a `100` | Percentagem do upload |
| `error` | `null` ou string | Mensagem de erro do servidor |

**Máquina de estados simples**
Usar uma string (`status`) em vez de múltiplos booleans (`isUploading`, `isProcessing`, etc.) evita estados impossíveis — por exemplo, `isUploading = true` e `isProcessing = true` ao mesmo tempo não faria sentido.

---

**A função `handleSubmit`:**
```js
async function handleSubmit() {
  if (!file) return                  // guarda defensiva

  setStatus('uploading')
  setUploadProgress(0)
  setError(null)

  try {
    const blob = await uploadMkv(file, (percent) => {
      setUploadProgress(percent)
      if (percent === 100) setStatus('processing')  // upload feito, Whisper a trabalhar
    })

    // download automático
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'legendas.srt'
    link.click()
    URL.revokeObjectURL(url)

    setStatus('done')
  } catch (err) {
    setError(err.response?.data?.detail ?? 'Erro ao processar o ficheiro.')
    setStatus('idle')
  }
}
```

**Download automático sem abrir nova página:**
O browser não permite fazer download de um blob diretamente. O truque é:
1. `URL.createObjectURL(blob)` — cria um URL temporário em memória (`blob:http://...`) que aponta para os dados.
2. Criamos um `<a>` invisível com `download="legendas.srt"` e simulamos um clique.
3. `URL.revokeObjectURL(url)` — liberta a memória imediatamente após o clique.

**`try/catch`**
Se o servidor devolver um erro (ex: 400, 500), o axios lança uma exceção. O `catch` apanha-a e extrai a mensagem:
```js
err.response?.data?.detail
```
- `?.` é o **optional chaining** — evita erros se `response` ou `data` for `undefined`.
- `?? 'Erro ao processar'` é o **nullish coalescing** — usa o valor da direita se o da esquerda for `null` ou `undefined`.

---

**Renderização condicional por estado:**
```jsx
{file && status === 'idle' && (
  <button onClick={handleSubmit}>Gerar Legendas</button>
)}
{status === 'uploading' && <p>A carregar... {uploadProgress}%</p>}
{status === 'processing' && <p>A processar com Whisper...</p>}
{status === 'done' && <p>Legendas geradas!</p>}
```
- O botão só aparece quando há ficheiro E o status é `idle` — impede submissões duplas.
- Cada linha do JSX mostra uma coisa diferente consoante o estado atual.

---

### Conceitos introduzidos neste passo

| Conceito | Explicação curta |
|---|---|
| **FormData** | Formato para enviar ficheiros via HTTP (multipart). |
| **blob** | Dados binários em memória — usado para ficheiros que o servidor devolve. |
| **async/await** | Sintaxe para trabalhar com operações assíncronas de forma legível. |
| **Máquina de estados** | Usar uma string de estado em vez de múltiplos booleans. |
| **Optional chaining (`?.`)** | Acede a propriedades aninhadas sem crashar se alguma for `undefined`. |
| **Nullish coalescing (`??`)** | Valor de fallback quando o resultado é `null` ou `undefined`. |
| **createObjectURL** | Cria URL temporário em memória para forçar download de um blob. |

---

## Próximo passo
**Passo 4 — Barra de progresso e estados visuais** (`src/components/ProgressStatus.jsx`)

---

## Passo 4 — Barra de progresso e estados visuais

**Data:** 2026-03-18

### O que foi feito

Extraímos os estados visuais do `App.jsx` para um componente dedicado `ProgressStatus`, e adicionámos a prop `disabled` ao `UploadArea` para bloquear interação durante o processamento.

---

### Ficheiros criados/alterados

#### `src/components/ProgressStatus.jsx` — Novo componente

```jsx
function ProgressStatus({ status, progress }) {
  if (status === 'idle') return null
  ...
}
```

**Porquê um componente separado?**
O `App.jsx` estava a crescer com lógica de apresentação misturada com lógica de negócio. Separar a barra de progresso num componente próprio torna cada ficheiro mais focado e fácil de ler.

**`if (status === 'idle') return null`**
Um componente React pode devolver `null` — isso significa "não renderiza nada". É a forma idiomática de esconder um componente sem usar CSS.

---

**Dois tipos de barra de progresso:**

```jsx
{status === 'uploading' && (
  <div className={styles.barFill} style={{ width: `${progress}%` }} />
)}

{status === 'processing' && (
  <div className={`${styles.barFill} ${styles.indeterminate}`} />
)}
```

| Tipo | Quando | Porquê |
|---|---|---|
| **Determinada** | Durante o upload | Sabemos a percentagem exata via `onUploadProgress` do axios |
| **Indeterminada** | Durante o Whisper | O modelo não reporta progresso — apenas sabemos que está a trabalhar |

A barra indeterminada usa uma animação CSS (`@keyframes slide`) para dar feedback visual sem precisar de dados reais.

---

**`style={{ width: \`${progress}%\` }}`**
- Estilos inline em React são passados como objeto JavaScript, não como string.
- Isto é necessário aqui porque o valor é dinâmico (muda a cada segundo). CSS Modules não conseguem lidar com valores dinâmicos — para isso usamos `style` diretamente.

---

#### `src/components/ProgressStatus.module.css`

```css
.indeterminate {
  width: 40%;
  animation: slide 1.2s ease-in-out infinite;
}

@keyframes slide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(300%); }
}
```

- `@keyframes` define uma animação com nome (`slide`).
- `animation: slide 1.2s ease-in-out infinite` — aplica a animação: nome, duração, easing, repetição infinita.
- `translateX` move o elemento horizontalmente sem afetar o layout (mais eficiente que `left`/`margin`).
- `overflow: hidden` no `.barTrack` esconde a barra quando sai dos limites.

---

#### `src/components/UploadArea.jsx` — Atualizado

Adicionada a prop `disabled`:

```jsx
function UploadArea({ onFileSelect, disabled = false }) {
```

- `disabled = false` é um **valor por defeito** — se o pai não passar a prop, assume `false`.

```jsx
onClick={() => !disabled && inputRef.current.click()}
```

- `!disabled &&` — só abre o seletor de ficheiros se `disabled` for `false`.
- Padrão comum para "executar ação apenas se condição for verdadeira" sem precisar de `if`.

```jsx
className={`... ${disabled ? styles.disabled : ''}`}
```

Nova classe `.disabled` no CSS:
```css
.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

- `opacity: 0.5` — visual desbotado para indicar inatividade.
- `cursor: not-allowed` — cursor de proibido ao passar o rato.
- `pointer-events: none` — bloqueia todos os eventos de rato no elemento e nos seus filhos (clique, drag, hover).

---

#### `src/App.jsx` — Atualizado

```jsx
const isProcessing = status === 'uploading' || status === 'processing'

<UploadArea onFileSelect={setFile} disabled={isProcessing} />
<ProgressStatus status={status} progress={uploadProgress} />
```

- `isProcessing` é uma variável derivada — calculada a partir do estado existente, não um `useState` extra. Sempre que `status` muda, `isProcessing` é recalculada automaticamente.
- O `App` passa `isProcessing` ao `UploadArea` e `status`/`progress` ao `ProgressStatus` — os filhos recebem dados, o pai controla a lógica.

---

### Conceitos introduzidos neste passo

| Conceito | Explicação curta |
|---|---|
| **`return null`** | Forma de esconder um componente sem CSS. |
| **Barra indeterminada** | Animação CSS para feedback quando não há progresso mensurável. |
| **`@keyframes`** | Define animações CSS reutilizáveis por nome. |
| **Estilo inline dinâmico** | `style={{ width: \`${value}%\` }}` para valores que mudam em runtime. |
| **Prop com valor por defeito** | `{ disabled = false }` evita erros quando a prop não é passada. |
| **`pointer-events: none`** | Bloqueia toda a interação de rato via CSS. |
| **Variável derivada** | Calcular valores a partir do estado em vez de criar novo `useState`. |

---

## Próximo passo
**Passo 5 — Estilos finais e botão de submissão** (`App.module.css` + ajustes visuais gerais)

---

## Passo 5 — Estilos finais e botão de submissão

**Data:** 2026-03-18

### O que foi feito

Criámos `App.module.css` para estilizar o `h1`, o botão de submissão e a mensagem de erro. Substituímos o estilo inline do erro por uma classe CSS e convertemos o `<button>` simples num botão com feedback visual de hover e clique.

---

### Ficheiros criados/alterados

#### `src/App.module.css` — Novo ficheiro

```css
.submitBtn {
  display: block;
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: #6366f1;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.submitBtn:hover  { background: #4f46e5; }
.submitBtn:active { background: #4338ca; }
```

**`display: block` + `width: 100%`**
Por defeito, um `<button>` é `inline` — ocupa apenas o espaço do seu texto. Com `display: block` e `width: 100%` passa a ocupar toda a largura do pai, alinhado com a zona de upload.

**`:hover` e `:active`**
- `:hover` — aplica-se quando o rato está por cima do elemento.
- `:active` — aplica-se no momento do clique (enquanto o botão do rato está pressionado).
- Estes estados visuais dão feedback ao utilizador de que o botão está a responder.

**`transition: background 0.2s`**
Anima a mudança de cor de fundo durante 0.2 segundos, tornando a transição suave em vez de abrupta.

**Porquê três tons de roxo?**
- `#6366f1` — estado normal (indigo-500)
- `#4f46e5` — hover (indigo-600, ligeiramente mais escuro)
- `#4338ca` — active (indigo-700, ainda mais escuro)

A progressão de escurecimento reforça visualmente a "profundidade" do clique.

---

```css
.error {
  margin-top: 12px;
  font-size: 0.875rem;
  color: #ef4444;
  text-align: center;
}
```

Substituímos `style={{ color: 'red', marginTop: '12px' }}` do `App.jsx` por esta classe. Vantagens:
- Mantém todos os estilos num só sítio.
- Evita misturar CSS com JSX sem necessidade (estilos inline só devem ser usados para valores dinâmicos).

---

#### `src/App.jsx` — Atualizado

```jsx
import styles from './App.module.css'

<button className={styles.submitBtn} onClick={handleSubmit}>
  Gerar Legendas
</button>

{error && <p className={styles.error}>{error}</p>}
```

- Importamos `App.module.css` como `styles`, igual ao que fizemos nos outros componentes.
- Removemos o estilo inline do erro — substituído pela classe `.error`.

---

### Estado final da aplicação

Com este passo, o frontend está completo. O fluxo de utilização é:

1. Utilizador arrasta ou seleciona um `.mkv`
2. Botão "Gerar Legendas" aparece
3. Clique envia o ficheiro — barra de progresso determinada durante o upload
4. Após upload, barra indeterminada animada enquanto o Whisper processa
5. Download automático do `.srt` quando termina

---

### Conceitos introduzidos neste passo

| Conceito | Explicação curta |
|---|---|
| **`display: block`** | Faz o elemento ocupar toda a linha, em vez de ficar inline com o texto. |
| **`:hover` / `:active`** | Pseudo-classes CSS para estados de interação do rato. |
| **`transition`** | Anima mudanças de propriedades CSS ao longo do tempo. |
| **Evitar estilos inline** | Estilos inline são para valores dinâmicos; valores fixos devem ir para CSS. |
