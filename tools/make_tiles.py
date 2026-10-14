# Tileset de deserto (estilo dos cenários de referência). Rode na raiz: python tools/make_tiles.py
from PIL import Image,ImageDraw,ImageFilter
import random
R=random.Random(11)
SA=(240,178,112);SD=(214,140,92);SL=(250,202,142);RD=(226,150,98);RK=(200,116,84)
BL=(224,162,120);BM=(196,130,98);BD=(150,92,72);GR=(70,132,60);GL=(110,176,80);DK=(70,38,30,255)
N=27;sheet=Image.new('RGBA',(16*N,16))
def ol(im):
    a=im.split()[3].filter(ImageFilter.MaxFilter(3));b=Image.new('RGBA',im.size,DK);b.putalpha(a);b.alpha_composite(im);return b
def put(i,fn,outline=False):
    im=Image.new('RGBA',(16,16));fn(ImageDraw.Draw(im))
    sheet.paste(ol(im) if outline else im,(i*16,0))
def sand(v):
    def f(d):
        d.rectangle([0,0,15,15],fill=SA)
        for _ in range(5):
            x,y=R.randint(0,12),R.randint(0,14);d.line([(x,y),(x+R.randint(1,3),y+R.randint(0,1))],fill=SD)
        for _ in range(4):d.point((R.randint(0,15),R.randint(0,15)),fill=SL)
        if v:d.ellipse([5,9,8,11],fill=SD);d.point((6,9),fill=SL)
    return f
def road(d):
    d.rectangle([0,0,15,15],fill=RD)
    for y in (0,8):
        for x in range(-4+(4 if y else 0),16,8):d.ellipse([x,y,x+7,y+7],outline=RK)
    for _ in range(6):d.point((R.randint(0,15),R.randint(0,15)),fill=(238,172,112))
def water(o):
    def f(d):
        d.rectangle([0,0,15,15],fill=(60,170,180))
        for x,y in [(2+o*3,4),(9-o*3,11)]:d.line([(x,y),(x+4,y)],fill=(140,225,225))
    return f
def shore(d):d.rectangle([0,0,15,1],fill=(246,214,150,255))
def brick(d):
    d.rectangle([0,0,15,15],fill=BL)
    for y in (0,5,10,15):d.line([(0,y),(15,y)],fill=BM)
    for y,o in ((1,3),(6,7),(11,3)):
        for x in (o,o+8):
            if x<16:d.line([(x,y),(x,y+3)],fill=BM)
    d.line([(0,15),(15,15)],fill=BD)
def fence(d):
    d.rectangle([0,7,15,15],fill=BL);d.line([(0,15),(15,15)],fill=BD)
    for x in (0,5,10):d.rounded_rectangle([x,1,x+4,9],radius=2,fill=(212,120,100),outline=BD)
    d.line([(0,10),(15,10)],fill=(246,214,120))
def door(d):brick(d);d.rectangle([3,2,12,15],fill=(110,60,36));d.rectangle([4,3,11,15],fill=(150,90,50));d.point((10,9),fill=(250,220,100));d.line([(8,3),(8,15)],fill=(120,70,40))
def win(d):brick(d);d.polygon([(4,12),(4,6),(8,2),(12,6),(12,12)],fill=(110,60,36));d.polygon([(5,11),(5,6),(8,3),(11,6),(11,11)],fill=(120,225,225));d.line([(8,3),(8,11)],fill=(80,150,160))
def palmtop(d):
    for b in [(0,3),(15,3),(2,0),(13,0),(8,0),(1,8),(14,8)]:d.line([(8,10),b],fill=(46,118,52),width=3)
    for b in [(1,4),(14,4),(8,1)]:d.line([(8,10),b],fill=(96,170,70))
    d.ellipse([6,8,10,12],fill=(120,80,40))
def palmtrunk(d):
    d.ellipse([1,11,15,16],fill=(196,122,84,200))
    d.rectangle([6,0,9,13],fill=(160,100,58))
    for y in (2,5,8,11):d.line([(6,y),(9,y+1)],fill=(110,66,36))
def cactus(d):
    d.ellipse([2,12,14,16],fill=(196,122,84,200));d.rectangle([6,3,10,14],fill=GR);d.rectangle([2,7,5,9],fill=GR);d.rectangle([2,4,3,8],fill=GR);d.rectangle([11,6,14,8],fill=GR);d.rectangle([13,3,14,7],fill=GR);d.line([(8,4),(8,13)],fill=GL)
def shrub(d):
    d.ellipse([2,11,14,16],fill=(196,122,84,200))
    for x,y in ((3,6),(8,3),(11,7),(6,8)):d.ellipse([x,y,x+4,y+6],fill=GR);d.line([(x+2,y),(x+2,y+5)],fill=GL)
def bones(d):d.line([(3,10),(12,6)],fill=(240,236,220),width=2);d.ellipse([2,9,4,12],fill=(240,236,220));d.ellipse([11,4,13,7],fill=(240,236,220))
def skull(d):d.ellipse([3,4,12,12],fill=(240,236,220));d.rectangle([5,11,10,14],fill=(240,236,220));d.rectangle([5,7,6,9],fill=(40,30,34));d.rectangle([9,7,10,9],fill=(40,30,34))
def torch(o):
    def f(d):
        d.rectangle([5,10,10,15],fill=(150,110,80));d.rectangle([4,9,11,10],fill=(190,150,110));d.rectangle([7,8,8,9],fill=(90,60,40))
        d.polygon([(8,1+o),(11,7),(8,9),(5,7)],fill=(250,120,30));d.polygon([(8,3+o),(10,7),(8,8),(6,7)],fill=(255,220,70))
    return f
def pyr(d):
    d.rectangle([0,0,15,15],fill=(214,148,108))
    for y in (3,7,11,15):d.line([(0,y),(15,y)],fill=(176,110,84))
    for y in (0,4,8,12):d.line([(0,y),(15,y)],fill=(246,214,130))
    for x,y in ((4,1),(11,5),(6,9),(13,13)):d.line([(x,y),(x,y+3)],fill=(176,110,84))
def slope(left):
    def f(d):
        p=[(0,15),(15,0),(15,15)] if left else [(0,0),(0,15),(15,15)]
        d.polygon(p,fill=(214,148,108))
        for y in (3,7,11):d.line([(0,y),(15,y)],fill=(176,110,84)) if False else None
        d.line([p[0],p[1]] if left else [p[0],p[2]],fill=(246,214,130));d.line([(0,15),(15,15)],fill=(176,110,84))
    return f
def doorway(d):pyr(d);d.rectangle([2,4,13,15],fill=(70,50,56));d.ellipse([2,0,13,9],fill=(70,50,56));d.rectangle([4,6,11,15],fill=(30,20,28));d.ellipse([4,2,11,9],fill=(30,20,28))
def pilltop(d):d.rectangle([1,2,14,6],fill=BL,outline=BD);d.rectangle([3,6,12,15],fill=BM);d.line([(3,10),(12,10)],fill=BD)
def pillbot(d):d.rectangle([3,0,12,10],fill=BM);d.rectangle([1,10,14,15],fill=BL,outline=BD);d.line([(3,4),(12,4)],fill=BD)
def rug(d):
    d.rectangle([0,0,15,15],fill=(236,208,120));d.rectangle([1,1,14,14],fill=(40,140,60));d.rectangle([3,3,12,12],outline=(250,230,130));d.rectangle([5,5,10,10],fill=(30,110,50),outline=(250,230,130))
T=[(0,sand(0)),(1,sand(1)),(2,road),(3,water(0)),(4,water(1)),(5,shore),(6,brick),(7,fence),(8,door),(9,win),(10,palmtop),(11,palmtrunk),(12,cactus),(13,shrub),(14,bones),(15,skull),(16,torch(0)),(17,torch(1)),(18,pyr),(19,slope(True)),(20,slope(False)),(21,doorway),(22,pilltop),(23,pillbot),(24,rug)]
for i,f in T:put(i,f,outline=i in (10,11,12,13,14,15,16,17))
sheet.save('assets/tiles.png')
import json
W,H=40,28;g=[['.']*W for _ in range(H)]
def S(x,y,c):
    if 0<=x<W and 0<=y<H:g[y][x]=c
def rect(x,y,w,h,c):
    for j in range(h):
        for i in range(w):S(x+i,y+j,c)
rect(0,16,40,3,',');rect(22,0,4,28,',');rect(11,11,2,5,',');rect(30,10,1,6,',')
for r in range(8):
    l=11-r;w=2+2*r
    for i in range(w):S(l+i,3+r,'Y')
    S(l,3+r,'<');S(l+w-1,3+r,'>')
rect(11,9,2,2,'G')
for x in (2,21):S(x,8,'I');S(x,9,'i')
def house(y0,north):
    rect(28,y0,10,7,'.');rect(28,y0,10,1,'F');rect(28,y0+4,10,1,'F') if north==0 else None
    if north==0:
        rect(28,y0+1,1,3,'F');rect(37,y0+1,1,3,'F');rect(31,y0+1,4,2,'m');rect(28,y0+5,10,2,'B');S(30,y0+6,'D');S(35,y0+6,'W')
    else:
        rect(28,y0,10,2,'B');S(30,y0,'D');S(35,y0,'W');rect(28,y0+2,1,3,'F');rect(37,y0+2,1,3,'F');rect(31,y0+2,4,2,'m');rect(28,y0+5,10,1,'F')
house(3,0);house(20,1)
for x,y in ((3,19),(1,24),(20,22),(6,25),(38,12),(1,2),(18,6)):S(x,y,'P');S(x,y+1,'p')
for x,y in ((2,14),(18,20),(27,13),(15,25),(33,14),(2,5),(36,17)):S(x,y,'c')
for x,y in ((20,3),(19,12),(1,10),(30,13),(12,23)):S(x,y,'s')
for x,y in ((5,12),(18,13),(8,20),(34,12),(27,23)):S(x,y,'b')
for x,y in ((16,12),(4,14),(21,25),(32,23)):S(x,y,'k')
for x,y in ((9,11),(14,11),(3,13),(27,15)):S(x,y,'t')
rect(13,22,4,3,'~')
npcs=[{"name":"Mestre Ptahor","x":13,"y":13,"color":"#e8e0c0","lines":["{n}, fale com Kaelen na estrada a leste. Um bom duelista aprende duelando!","Cada vitória rende moedas e cartas. Pressione Esc ou ☰ para o menu de pausa."]},
{"name":"Aldeã","x":21,"y":13,"color":"#e67e22","lines":["As Oito Estrelas do Faraó reúnem os melhores duelistas do Nilo.","Dizem que o torneio dá acesso ao Grande Santuário."]},
{"name":"Nefer","x":9,"y":20,"color":"#d35400","duel":"jovem","pre":["Ei, {n}! Quer treinar? Meu deck não é fácil!"],"post":["Boa luta! Você vai longe."]},
{"name":"Kaelen","x":30,"y":17,"color":"#2c3e50","duel":"rival","pre":["Então você também vai ao torneio, {n}? Mostre o que seu deck sabe fazer!"],"post":["Da próxima vez eu ganho. Nos vemos no torneio!"]}]
m=json.load(open('data/maps.json'));m[0].update(rows=[''.join(r) for r in g],npcs=npcs,start=[23,17],
 legend={".":0,":":1,",":2,"~":3,"B":6,"F":7,"D":8,"W":9,"P":10,"p":11,"c":12,"s":13,"b":14,"k":15,"t":16,"Y":18,"<":19,">":20,"G":21,"I":22,"i":23,"m":24},solid="~BFDWpcstY<>GIi")
json.dump(m,open('data/maps.json','w'),ensure_ascii=False,separators=(',',':'))
print('tiles+mapa ok')
