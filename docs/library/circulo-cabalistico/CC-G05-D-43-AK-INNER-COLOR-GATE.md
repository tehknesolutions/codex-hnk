# CC-G05-D — Gate cromático dos 43 AK restantes

**Corpus:** Círculo Cabalístico / HNK / CABALA  
**Autoridade canônica:** TW DA VINCI  
**Fonte:** SOURCE-RASTER-900, 900×900 px  
**Estado:** CANON-ANALYSIS / EM MEDIÇÃO

## Estado herdado

```text
AK_TOTAL = 475
RADIAL-AK COLOR-RESOLVED = 432
RESTANTES = 43
```

Decomposição dos restantes:

```text
HEADER-AK = 9
TRANSITION-AK = 12
ROSE-AK = 22
9 + 12 + 22 = 43
```

## Regra deste gate

A inspeção direta da fonte confirma que os 43 AK restantes não podem ser classificados com segurança usando simplesmente o COLOR-ID do setor radial correspondente. Há texto, glifos, contornos e, sobretudo na Rosa, geometrias sobrepostas que atravessam os pontos de amostragem.

Portanto, para cada AK interno, a classificação deve usar uma **máscara interior** da célula e a **cor modal estrutural**, descartando:

- pixels de contorno;
- preto de texto/glifo;
- tinta de símbolo;
- antialiasing;
- pixels próximos às fronteiras;
- regiões pertencentes a elementos sobrepostos.

## Protocolo pixel-exact

Para cada AK:

```text
1. construir POLYGON/MASK do interior;
2. aplicar erosão da máscara para excluir bordas;
3. obter histograma RGB dos pixels internos;
4. remover INK/SYMBOL pixels conhecidos;
5. obter RGB modal de fundo;
6. comparar com COLOR-ID existentes;
7. reutilizar COLOR-ID quando houver igualdade estrutural;
8. criar novo COLOR-ID apenas para novo fundo comprovado;
9. registrar CONFIDENCE e SOURCE-ID.
```

Schema de saída:

```text
AK-ID
REGION-ID
MASK-ID
COLOR-ID
RGB
HEX
PIXEL-SAMPLE-N
DOMINANCE-RATIO
CONFIDENCE
SOURCE-ID
```

## Critério de fechamento

O gate só recebe PASS quando:

```text
HEADER_RESOLVED + TRANSITION_RESOLVED + ROSE_RESOLVED = 43
432 + 43 = 475
UNRESOLVED = 0
```

ou quando qualquer AK que a fonte de 900 px não permita resolver permanecer explicitamente `UNRESOLVED`, sem inferência visual.

## Próxima operação

Construir primeiro as 9 máscaras HEADER, depois 12 TRANSITION e finalmente as 22 máscaras da Rosa. A Rosa será tratada em três estratos independentes (3/7/12), preservando a geometria já medida.
