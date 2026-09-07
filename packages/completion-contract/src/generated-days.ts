import type { CompleteDayRequestV1 } from "./types.js";

export interface GeneratedDayCompletionBinding {
  day: number;
  sephira: string;
  completionContractId: string;
  questDefinitionId: string;
  canonicalSourceSha: string;
  canonicalXp: number;
}

export const GENERATED_DAY_COMPLETIONS: Readonly<Record<number, GeneratedDayCompletionBinding>> = Object.freeze(
  Object.fromEntries([
    [37, {"day":37,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D037-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D037-RC2","canonicalSourceSha":"70c0218e6ee41020a4146a73a87b0db02876f7fd650677da675fdebdb905fbf6","canonicalXp":100}],
    [38, {"day":38,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D038-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D038-RC2","canonicalSourceSha":"ed3c1603c6cd94b45b4bfdcf6e449f15cea153c220d4afa1d84c542fcd17184b","canonicalXp":100}],
    [39, {"day":39,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D039-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D039-RC2","canonicalSourceSha":"f125341b73ea1698a87a2e6b986fff8fefb0bf562560d7a0bb48e6c32c8e0ae2","canonicalXp":100}],
    [40, {"day":40,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D040-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D040-RC2","canonicalSourceSha":"b1b7e7cd43c83515827e5d33ef96c6e49a6cc7f11659fa2f3b14b32167304e00","canonicalXp":150}],
    [41, {"day":41,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D041-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D041-RC2","canonicalSourceSha":"41cf7dfa94410876926c1c5b389ecea65b548231e545230192257195f1c79e1b","canonicalXp":150}],
    [42, {"day":42,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D042-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D042-RC2","canonicalSourceSha":"ed81af8abe6c1ff350c472d410c79a29785532679f01f565916ba5ef535a74ec","canonicalXp":100}],
    [43, {"day":43,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D043-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D043-RC2","canonicalSourceSha":"5bc086418322428f33379cd706b4ed62fa0a35711738968246094a284551c373","canonicalXp":150}],
    [44, {"day":44,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D044-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D044-RC2","canonicalSourceSha":"00ddc5aae16a3f4cef5bcffbc9a8c10cd7a448d7ddcd4ebbf6f40baba352236a","canonicalXp":150}],
    [45, {"day":45,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D045-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D045-RC2","canonicalSourceSha":"0fc535396ab6c9eb6b6461051c258fa3f586ea37921f71ad6dd7b33babb80232","canonicalXp":100}],
    [46, {"day":46,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D046-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D046-RC2","canonicalSourceSha":"e5bf4ceb5e90abf27c4beea6395b14934f6b626cc7be4f7c17727d4db8221906","canonicalXp":150}],
    [47, {"day":47,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D047-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D047-RC2","canonicalSourceSha":"7d87f83cd21bb9f5b62b1f1c80312ae9c48b3f6ae0199f8d85a5d6666eb589d6","canonicalXp":150}],
    [48, {"day":48,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D048-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D048-RC2","canonicalSourceSha":"9e788bb13e1455416aa446169f27e78648f4efd385994aaa241d072a6ca30e8b","canonicalXp":150}],
    [49, {"day":49,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D049-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D049-RC2","canonicalSourceSha":"965c50ae53a47bb05404bcd33e233df49e6230549bcd4b5606849be41336412f","canonicalXp":100}],
    [50, {"day":50,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D050-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D050-RC2","canonicalSourceSha":"531849fb14b24729f73ecab1998cd40a69f668eb18cc67897e3a631ca92fe286","canonicalXp":200}],
    [51, {"day":51,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D051-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D051-RC2","canonicalSourceSha":"d29b294a42eb33528fa7063c8d32806f23f1adb66ffab2f84ff7d78ce2e52e67","canonicalXp":200}],
    [52, {"day":52,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D052-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D052-RC2","canonicalSourceSha":"6ae8894c36c108b7be6d5e4fb1c88c0ad1c9e076c282037fe97ba98145fd0aa8","canonicalXp":100}],
    [53, {"day":53,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D053-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D053-RC2","canonicalSourceSha":"9e409ef952bbb6bab9513ea2a3482a4a00b8db67ce33522de3b7a62643968971","canonicalXp":250}],
    [54, {"day":54,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D054-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D054-RC2","canonicalSourceSha":"5a72ec58ea61ee31d004fde5da40088d194ce0f1a000ace1de12c5373c323871","canonicalXp":150}],
    [55, {"day":55,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D055-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D055-RC2","canonicalSourceSha":"f808560c95ca52e4b6efb4d4d7817a15d42132c8b97b2ba30d892d1e277ede4d","canonicalXp":200}],
    [56, {"day":56,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D056-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D056-RC2","canonicalSourceSha":"01306eb8ff858a21bb964f839d9ed6d950528d4c4f1dbc3bb85d43707033491c","canonicalXp":150}],
    [57, {"day":57,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D057-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D057-RC2","canonicalSourceSha":"816cc3eb290e69b5643a8c0314f4205de880ec3a9415923c28819d80c0f8d925","canonicalXp":250}],
    [58, {"day":58,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D058-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D058-RC2","canonicalSourceSha":"825fa93a68666b314314d97532d4e75df5bdcc57d6ddc804b79e4090a3d23b93","canonicalXp":150}],
    [59, {"day":59,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D059-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D059-RC2","canonicalSourceSha":"b4327264ee3c3b84adceae0d8e809ecde8eed0c88ac9324844f0ab8b578b256b","canonicalXp":150}],
    [60, {"day":60,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D060-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D060-RC2","canonicalSourceSha":"1ae9546162862220cbcb7d938a365e4ce7d88fd0e493429d8c725fa4e4af00a1","canonicalXp":150}],
    [61, {"day":61,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D061-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D061-RC2","canonicalSourceSha":"213d43194453034a71c8817ee1d87d41f4ee3b2070ae7ef1cd16afa971f292ef","canonicalXp":150}],
    [62, {"day":62,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D062-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D062-RC2","canonicalSourceSha":"9063a9e4dd1e96a9a3138bafc7af5feec7b688a52f9bedf3f54da407491aded4","canonicalXp":150}],
    [63, {"day":63,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D063-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D063-RC2","canonicalSourceSha":"76412fb11c56a01375f50b1a8658d791f9e5c7c46c9453ea791606cbe10cde2e","canonicalXp":150}],
    [64, {"day":64,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D064-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D064-RC2","canonicalSourceSha":"bd0fd52c0ec02078e91f2847b29cda4c3c05591097a11476c0e962987323f004","canonicalXp":200}],
    [65, {"day":65,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D065-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D065-RC2","canonicalSourceSha":"205c830c7cd333dc26cd7b0bcb34140c498213b47da2b6bafde77e43226a547e","canonicalXp":150}],
    [66, {"day":66,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D066-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D066-RC2","canonicalSourceSha":"c67c7de144c0abde4efa6307877f04509a4b70beb4d9b29b0b5ecfc296fafb24","canonicalXp":200}],
    [67, {"day":67,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D067-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D067-RC2","canonicalSourceSha":"18ea428f8816648f3901a4c4e7910afc98942cd319dd51c94516083cb18ae5a6","canonicalXp":200}],
    [68, {"day":68,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D068-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D068-RC2","canonicalSourceSha":"fe10dd51f004fb1ab7ea044d240741161bacd8f88bca16445629c986af13b964","canonicalXp":200}],
    [69, {"day":69,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D069-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D069-RC2","canonicalSourceSha":"ec7ba6b4898c3ae7771a739a7241cde097db07cb4a6b574e91291c897567cd5b","canonicalXp":150}],
    [70, {"day":70,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D070-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D070-RC2","canonicalSourceSha":"6d4b55eedf1de45523cccd04432de2c814e84a45ca477ac95f3253779eafb4ff","canonicalXp":200}],
    [71, {"day":71,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D071-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D071-RC2","canonicalSourceSha":"b65692f69924622f6093b927adf7b86de151a68a050dd16d1f585a1c67e9c9df","canonicalXp":250}],
    [72, {"day":72,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D072-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D072-RC2","canonicalSourceSha":"a70c62e96488df293fa03644e8a1b051b14d339de8e5aa0e9659b2e93c7a14c9","canonicalXp":300}],
    [73, {"day":73,"sephira":"Chokhmah","completionContractId":"HNK-CHOKHMAH-D073-COMP-RC2","questDefinitionId":"HNK-CHOKHMAH-D073-RC2","canonicalSourceSha":"7d0ebe629776e2b97016af324535ef59b7a80370fa0fe4e741e5e8d42464499d","canonicalXp":500}],
    [74, {"day":74,"sephira":"Binah","completionContractId":"HNK-BINAH-D074-COMP-RC2","questDefinitionId":"HNK-BINAH-D074-RC2","canonicalSourceSha":"da3a764d5a7485ec47fc8a32bc6c75cfe373fd6d92e0be071c669c062339cddd","canonicalXp":100}],
    [75, {"day":75,"sephira":"Binah","completionContractId":"HNK-BINAH-D075-COMP-RC2","questDefinitionId":"HNK-BINAH-D075-RC2","canonicalSourceSha":"9099e33e1b6688635fce5be36fb90c3312211c76b1e83d273ac7225c28139ebd","canonicalXp":100}],
    [76, {"day":76,"sephira":"Binah","completionContractId":"HNK-BINAH-D076-COMP-RC2","questDefinitionId":"HNK-BINAH-D076-RC2","canonicalSourceSha":"ec754137f0fc3f7a742b1ae3c502725ce25cce3ed018f63f6e333ca1c72c32dd","canonicalXp":100}],
    [77, {"day":77,"sephira":"Binah","completionContractId":"HNK-BINAH-D077-COMP-RC2","questDefinitionId":"HNK-BINAH-D077-RC2","canonicalSourceSha":"16f8dd9666cebc996d5862720dd8f6dacdda5c1bffd4ee23d554fcc4bbf70f7e","canonicalXp":150}],
    [78, {"day":78,"sephira":"Binah","completionContractId":"HNK-BINAH-D078-COMP-RC2","questDefinitionId":"HNK-BINAH-D078-RC2","canonicalSourceSha":"c1d5ddbe6ec6e7076bc8dff6c7cb2333c0f9b4b552c4c8227f09774c4d864b48","canonicalXp":100}],
    [79, {"day":79,"sephira":"Binah","completionContractId":"HNK-BINAH-D079-COMP-RC2","questDefinitionId":"HNK-BINAH-D079-RC2","canonicalSourceSha":"205275d9e0a9b546e2aa606eafd69e78c0e5d943b9c9785c800565419abc7351","canonicalXp":100}],
    [80, {"day":80,"sephira":"Binah","completionContractId":"HNK-BINAH-D080-COMP-RC2","questDefinitionId":"HNK-BINAH-D080-RC2","canonicalSourceSha":"37b3a653314dd8ca65f16f14736f96bdc9505d177fcfacfecafa60c24e9b57c3","canonicalXp":100}],
    [81, {"day":81,"sephira":"Binah","completionContractId":"HNK-BINAH-D081-COMP-RC2","questDefinitionId":"HNK-BINAH-D081-RC2","canonicalSourceSha":"ebcad6d7579a2ca8cd82c82c5c689425b86ae35ab6a0aed8c432bb38d6d84962","canonicalXp":150}],
    [82, {"day":82,"sephira":"Binah","completionContractId":"HNK-BINAH-D082-COMP-RC2","questDefinitionId":"HNK-BINAH-D082-RC2","canonicalSourceSha":"387033a1f27600a7313f3c9e66c8be64110198849158f04ff5d3516b6f0a0e85","canonicalXp":100}],
    [83, {"day":83,"sephira":"Binah","completionContractId":"HNK-BINAH-D083-COMP-RC2","questDefinitionId":"HNK-BINAH-D083-RC2","canonicalSourceSha":"56f2b79d55277d5715150bc0aa11d37aaace2029b251fdcd6c3a6ab7048b914f","canonicalXp":150}],
    [84, {"day":84,"sephira":"Binah","completionContractId":"HNK-BINAH-D084-COMP-RC2","questDefinitionId":"HNK-BINAH-D084-RC2","canonicalSourceSha":"070d84b3d01fa18a9b9fc808bd840188edf05b7114a1d4567695901f7a214268","canonicalXp":100}],
    [85, {"day":85,"sephira":"Binah","completionContractId":"HNK-BINAH-D085-COMP-RC2","questDefinitionId":"HNK-BINAH-D085-RC2","canonicalSourceSha":"a86ffad21a97e9a4d0ddfe5d631d6086df3005c026fb362a612a8259191be711","canonicalXp":150}],
    [86, {"day":86,"sephira":"Binah","completionContractId":"HNK-BINAH-D086-COMP-RC2","questDefinitionId":"HNK-BINAH-D086-RC2","canonicalSourceSha":"cd48d88c7e3b11ffc6e0fc56c0d042b1bb31e4738188df9edb1ac397053ca0ee","canonicalXp":100}],
    [87, {"day":87,"sephira":"Binah","completionContractId":"HNK-BINAH-D087-COMP-RC2","questDefinitionId":"HNK-BINAH-D087-RC2","canonicalSourceSha":"45d923453248dc1c0d9ce12f42d4fb5580ec166a07d6ff0127d0c765c8d3bb5d","canonicalXp":100}],
    [88, {"day":88,"sephira":"Binah","completionContractId":"HNK-BINAH-D088-COMP-RC2","questDefinitionId":"HNK-BINAH-D088-RC2","canonicalSourceSha":"90df0e890be8fc00730cb263fe46fd610caba8bda3908c18876525fab69786fd","canonicalXp":150}],
    [89, {"day":89,"sephira":"Binah","completionContractId":"HNK-BINAH-D089-COMP-RC2","questDefinitionId":"HNK-BINAH-D089-RC2","canonicalSourceSha":"a3922c4e5aa5b93ba645c2b1c7609c96a6b6aa21e33cf7b2d1f5894be60e1fcc","canonicalXp":200}],
    [90, {"day":90,"sephira":"Binah","completionContractId":"HNK-BINAH-D090-COMP-RC2","questDefinitionId":"HNK-BINAH-D090-RC2","canonicalSourceSha":"48b639085155dd868c8732a38e2bf7ddb0116ea1db6b8a0695ba12d8e83ef190","canonicalXp":150}],
    [91, {"day":91,"sephira":"Binah","completionContractId":"HNK-BINAH-D091-COMP-RC2","questDefinitionId":"HNK-BINAH-D091-RC2","canonicalSourceSha":"8d64e873cf248b4d7560b1714751831c4d8763a171a734e49bdaf34693413c5a","canonicalXp":100}],
    [92, {"day":92,"sephira":"Binah","completionContractId":"HNK-BINAH-D092-COMP-RC2","questDefinitionId":"HNK-BINAH-D092-RC2","canonicalSourceSha":"2903e65fc9c6b9bdb09a63d9c862e3abcdd9d2c7b1390c57cc3fedaa300edb36","canonicalXp":100}],
    [93, {"day":93,"sephira":"Binah","completionContractId":"HNK-BINAH-D093-COMP-RC2","questDefinitionId":"HNK-BINAH-D093-RC2","canonicalSourceSha":"921a8f4414e793f1be3b70f77acb573c08d9d4aba975e91706b3d29ea829701a","canonicalXp":100}],
    [94, {"day":94,"sephira":"Binah","completionContractId":"HNK-BINAH-D094-COMP-RC2","questDefinitionId":"HNK-BINAH-D094-RC2","canonicalSourceSha":"0ee84dd28a2199afe42b0047b3540bcb31460540fd03f592f5b0db34ecc43138","canonicalXp":100}],
    [95, {"day":95,"sephira":"Binah","completionContractId":"HNK-BINAH-D095-COMP-RC2","questDefinitionId":"HNK-BINAH-D095-RC2","canonicalSourceSha":"6f924e4a4c6c1b921b49c94f74f76e48daaf068ae58b38b2f5083fbe95fa0eb5","canonicalXp":150}],
    [96, {"day":96,"sephira":"Binah","completionContractId":"HNK-BINAH-D096-COMP-RC2","questDefinitionId":"HNK-BINAH-D096-RC2","canonicalSourceSha":"afffb8215719d08e6d3068e87b80af7d44e314bae33fe5c4ff186aef0ec1e80c","canonicalXp":100}],
    [97, {"day":97,"sephira":"Binah","completionContractId":"HNK-BINAH-D097-COMP-RC2","questDefinitionId":"HNK-BINAH-D097-RC2","canonicalSourceSha":"e49b635dfd58d5460151039ccad4cec1ea64d7b1c4d4d01481e451eb914a06f3","canonicalXp":150}],
    [98, {"day":98,"sephira":"Binah","completionContractId":"HNK-BINAH-D098-COMP-RC2","questDefinitionId":"HNK-BINAH-D098-RC2","canonicalSourceSha":"5556048ba3470da3c59a36376624907b6794bd0f3fd9810ee109cbff5f745bee","canonicalXp":150}],
    [99, {"day":99,"sephira":"Binah","completionContractId":"HNK-BINAH-D099-COMP-RC2","questDefinitionId":"HNK-BINAH-D099-RC2","canonicalSourceSha":"620770df36f5a11f34d9748922c2763c077a602e7a29d0b3fe2f570670e8224c","canonicalXp":100}],
    [100, {"day":100,"sephira":"Binah","completionContractId":"HNK-BINAH-D100-COMP-RC2","questDefinitionId":"HNK-BINAH-D100-RC2","canonicalSourceSha":"0e8d3b7473ef6e96d62c19b7d807cb325536385743a95787eac0a2e21806aaeb","canonicalXp":150}],
    [101, {"day":101,"sephira":"Binah","completionContractId":"HNK-BINAH-D101-COMP-RC2","questDefinitionId":"HNK-BINAH-D101-RC2","canonicalSourceSha":"1ab44e237819cfc52e24b049ece26e6f5e1e54e3d755d173c85880bb9d4f9650","canonicalXp":100}],
    [102, {"day":102,"sephira":"Binah","completionContractId":"HNK-BINAH-D102-COMP-RC2","questDefinitionId":"HNK-BINAH-D102-RC2","canonicalSourceSha":"0ea348e8419d15f35fbc150cb5b20e787d830741d7e0ba37de8fd7f8d09f7ce2","canonicalXp":150}],
    [103, {"day":103,"sephira":"Binah","completionContractId":"HNK-BINAH-D103-COMP-RC2","questDefinitionId":"HNK-BINAH-D103-RC2","canonicalSourceSha":"feb63efadd7418bcbc6c7932e2672f7963174552b8bc3e6f65e8286b84f9c89c","canonicalXp":100}],
    [104, {"day":104,"sephira":"Binah","completionContractId":"HNK-BINAH-D104-COMP-RC2","questDefinitionId":"HNK-BINAH-D104-RC2","canonicalSourceSha":"fe4f62300e1a0309c5b90ebc6366bca352a4be00c9b2d2c8f373f2111d5d8f0c","canonicalXp":100}],
    [105, {"day":105,"sephira":"Binah","completionContractId":"HNK-BINAH-D105-COMP-RC2","questDefinitionId":"HNK-BINAH-D105-RC2","canonicalSourceSha":"f705281bb49d9384057194f8a3974b11b342965c93b6261500f69c1b9079134f","canonicalXp":200}],
    [106, {"day":106,"sephira":"Binah","completionContractId":"HNK-BINAH-D106-COMP-RC2","questDefinitionId":"HNK-BINAH-D106-RC2","canonicalSourceSha":"9b78740f4c5903dbe5d3383d93f9cb652e16359e21b4266e1476ecca14c1d5c1","canonicalXp":150}],
    [107, {"day":107,"sephira":"Binah","completionContractId":"HNK-BINAH-D107-COMP-RC2","questDefinitionId":"HNK-BINAH-D107-RC2","canonicalSourceSha":"531dabc9f050dabea030a02885762b6e4ca7293c2f9c0df5ffef9b35ae7c3664","canonicalXp":150}],
    [108, {"day":108,"sephira":"Binah","completionContractId":"HNK-BINAH-D108-COMP-RC2","questDefinitionId":"HNK-BINAH-D108-RC2","canonicalSourceSha":"5eb22449f595c811cf529cef4ea5adf912d8cd6a50f764fe2b4f693fa4437d46","canonicalXp":250}],
    [109, {"day":109,"sephira":"Binah","completionContractId":"HNK-BINAH-D109-COMP-RC2","questDefinitionId":"HNK-BINAH-D109-RC2","canonicalSourceSha":"45926fe354dfaa39daaacdab0574317246c0681c6b61b002a9b9c9210a4e36ef","canonicalXp":500}],
  ] as const),
);

export interface GeneratedCompletionInput {
  day: number;
  sessionId: string;
  clientCompletionId: string;
  localRecordHash?: string;
  clientCompletedAt?: string;
}

export function buildGeneratedCompletionRequest(input: GeneratedCompletionInput): CompleteDayRequestV1 {
  const binding = GENERATED_DAY_COMPLETIONS[input.day];
  if (!binding) throw new Error(`unsupported_generated_day:${input.day}`);
  return {
    day: binding.day,
    sessionId: input.sessionId,
    completionContractId: binding.completionContractId,
    questDefinitionId: binding.questDefinitionId,
    canonicalSourceSha: binding.canonicalSourceSha,
    clientCompletionId: input.clientCompletionId,
    clientCompletedAt: input.clientCompletedAt,
    localRecordHash: input.localRecordHash,
    mode: "first_completion",
  };
}
