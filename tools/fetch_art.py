# Baixa a arte recortada (YGOPRODeck) para assets/cards/<id>.jpg. Rode na raiz do projeto: python tools/fetch_art.py
# Não faça hotlink: baixe uma vez e use localmente. Artes oficiais são IP da Konami; não publique sem autorização.
import json,os,time,urllib.parse,urllib.request
os.makedirs("assets/cards",exist_ok=True)
for cid,name in json.load(open("data/art-map.json")).items():
    try:
        d=json.load(urllib.request.urlopen("https://db.ygoprodeck.com/api/v7/cardinfo.php?name="+urllib.parse.quote(name)))["data"][0]
        urllib.request.urlretrieve(d["card_images"][0]["image_url_cropped"],f"assets/cards/{cid}.jpg");print("ok",cid)
    except Exception as e: print("falhou",cid,e)
    time.sleep(.3)
