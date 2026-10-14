# Baixa a arte recortada de cada carta (YGOPRODeck) e converte em sprite pixel-art: assets/cards/<id>.png
# Uso (na raiz do projeto, com internet): pip install pillow && python tools/make_card_sprites.py [tamanho=48]
# Baixe uma vez e use localmente (não faça hotlink). Artes oficiais são IP da Konami: não publique sem autorização.
import io,json,os,sys,time,urllib.parse,urllib.request
from PIL import Image
S=int(sys.argv[1]) if len(sys.argv)>1 else 48
os.makedirs("assets/cards",exist_ok=True)
for cid,name in json.load(open("data/art-map.json")).items():
    try:
        u="https://db.ygoprodeck.com/api/v7/cardinfo.php?name="+urllib.parse.quote(name)
        d=json.load(urllib.request.urlopen(urllib.request.Request(u,headers={"User-Agent":"ecos-do-milenio-dev"})))["data"][0]
        raw=urllib.request.urlopen(d["card_images"][0]["image_url_cropped"]).read()
        im=Image.open(io.BytesIO(raw)).convert("RGB").resize((S,S),Image.BOX).quantize(40,method=Image.MEDIANCUT,dither=0)
        im.save(f"assets/cards/{cid}.png",optimize=True);print("ok",cid,name)
    except Exception as e:print("falhou",cid,name,e)
    time.sleep(.2)
