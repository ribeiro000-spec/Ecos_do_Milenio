# Catálogo ORIGINAL do jogo + sprites 64x64 detalhados de cada carta (gerados proceduralmente).
# Rode na raiz: python tools/build_cards.py  -> data/cards.json, data/decks.json, assets/cards/<id>.png
from PIL import Image,ImageDraw,ImageFilter
import random,math,json
H=lambda s:tuple(int(s[i:i+2],16) for i in (1,3,5))
def L(c,n):return tuple(max(0,min(255,int(x+n))) for x in c)
PR={'C':20,'U':90,'R':300,'SR':900,'UR':2200}
ATTR={'Fogo':((60,10,8),(255,150,50)),'Água':((8,28,90),(70,190,230)),'Vento':((22,86,80),(200,245,210)),'Terra':((56,32,14),(214,160,86)),'Luz':((130,90,16),(255,243,170)),'Trevas':((18,8,40),(120,66,170))}
AC={'Fogo':(255,120,40),'Água':(60,160,255),'Vento':(90,230,150),'Terra':(200,150,70),'Luz':(255,230,100),'Trevas':(170,90,230)}
def grad(a,b):
    im=Image.new('RGBA',(64,64));d=ImageDraw.Draw(im)
    for y in range(64):
        t=y/63;d.line([(0,y),(63,y)],fill=tuple(int(a[i]+(b[i]-a[i])*t) for i in range(3))+(255,))
    return im
def bg(attr,seed):
    r=random.Random(seed);a,b=ATTR[attr];im=grad(a,b);d=ImageDraw.Draw(im,'RGBA')
    if attr=='Fogo':
        for _ in range(18):x,y=r.randint(0,63),r.randint(0,60);d.point((x,y),fill=(255,210,90,255));d.point((x,y+1),fill=(255,110,30,200))
        d.polygon([(0,63),(0,55),(10,59),(22,53),(36,59),(50,54),(63,58),(63,63)],fill=(255,100,20,255))
    if attr=='Água':
        for k in range(6):
            for x in range(64):d.point((x,10+k*10+int(2.5*math.sin(x/5+k*2))),fill=(200,240,255,120))
        for _ in range(8):x,y=r.randint(2,60),r.randint(2,60);d.ellipse([x,y,x+3,y+3],outline=(220,250,255,200))
    if attr=='Vento':
        for _ in range(9):x,y=r.randint(0,40),r.randint(4,58);d.arc([x,y,x+22,y+8],200,340,fill=(255,255,255,170))
    if attr=='Terra':
        d.polygon([(0,63),(0,50),(16,44),(34,52),(50,42),(63,50),(63,63)],fill=(120,70,34,255));d.polygon([(0,63),(0,58),(24,54),(44,59),(63,55),(63,63)],fill=(90,50,24,255))
        for _ in range(8):x,y=r.randint(0,60),r.randint(8,40);d.point((x,y),fill=(240,200,130,255))
    if attr=='Luz':
        for k in range(9):a0=-90+k*20-80;d.polygon([(32,-4),(32+80*math.cos(math.radians(a0)),-4+80*math.sin(math.radians(a0+10))),(32+80*math.cos(math.radians(a0+9)),-4+80*math.sin(math.radians(a0+19)))],fill=(255,255,220,60))
        for _ in range(10):x,y=r.randint(0,63),r.randint(0,63);d.point((x,y),fill=(255,255,255,255))
    if attr=='Trevas':
        for _ in range(22):x,y=r.randint(0,63),r.randint(0,50);d.point((x,y),fill=(255,255,255,r.randint(120,255)))
        d.ellipse([44,4,58,18],fill=(235,225,255,255));d.ellipse([49,2,62,15],fill=(40,20,80,255))
    return im
def shade(im):
    W,Hh=im.size;px=im.load();out=im.copy();o=out.load()
    df=lambda p,q:q[3]==0 or abs(p[0]-q[0])+abs(p[1]-q[1])+abs(p[2]-q[2])>24
    for y in range(Hh):
        for x in range(W):
            p=px[x,y]
            if p[3]==0:continue
            k=1.12-.3*(y/Hh);r,g,b=[min(255,int(v*k)) for v in p[:3]]
            tl=px[x-1,y-1] if x>0 and y>0 else (0,0,0,0);br=px[x+1,y+1] if x<W-1 and y<Hh-1 else (0,0,0,0)
            if df(p,tl):r,g,b=min(255,r+42),min(255,g+42),min(255,b+42)
            elif df(p,br):r,g,b=int(r*.58),int(g*.58),int(b*.58)
            o[x,y]=(r,g,b,p[3])
    return out
def outline(im):
    a=im.split()[3].filter(ImageFilter.MaxFilter(3));b=Image.new('RGBA',im.size,(14,8,16,255));b.putalpha(a);return b
def glow(im,col):
    a=im.split()[3].filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.GaussianBlur(3));g=Image.new('RGBA',im.size,col+(0,));g.putalpha(a.point(lambda v:int(v*.75)));return g
# ---------- espécies de monstros ----------
def dragon(d,M,A,o):
    M2=L(M,-45);ML=L(M,40)
    d.polygon([(16,46),(3,52),(2,45),(10,41),(24,40)],fill=M2)
    if o.get('w',1):
        for sx in (1,-1):
            X=lambda x:32+sx*(x-32)
            d.polygon([(X(24),32),(X(4),10),(X(12),24),(X(2),22),(X(16),37)],fill=A);d.line([(X(24),32),(X(4),10)],fill=M2);d.line([(X(22),34),(X(8),26)],fill=M2)
    d.ellipse([17,28,47,55],fill=M);d.ellipse([24,34,40,55],fill=ML)
    for y in (38,42,46,50):d.line([(25,y),(39,y)],fill=L(ML,-25))
    d.rectangle([19,48,26,59],fill=M2);d.rectangle([38,48,45,59],fill=M2);d.polygon([(19,59),(15,62),(27,62),(26,59)],fill=M2);d.polygon([(38,59),(36,62),(49,62),(45,59)],fill=M2)
    for hx in ([32] if o.get('h',1)==1 else [18,32,46]):
        d.polygon([(hx-3,34),(hx-5,16),(hx+5,14),(hx+4,34)],fill=M);d.ellipse([hx-9,6,hx+9,20],fill=M);d.polygon([(hx+4,12),(hx+14,14),(hx+12,19),(hx+3,19)],fill=ML)
        d.polygon([(hx-6,8),(hx-11,0),(hx-2,6)],fill=A);d.polygon([(hx+2,6),(hx+8,0),(hx+6,9)],fill=A);d.ellipse([hx+1,10,hx+5,14],fill=(255,235,70));d.point((hx+3,12),fill=(0,0,0));d.polygon([(hx+6,19),(hx+8,22),(hx+9,19)],fill=(250,250,240))
def mage(d,M,A,o):
    M2=L(M,-40);sk=(150,100,70) if o.get('dk') else (236,190,150)
    d.polygon([(32,24),(14,60),(50,60)],fill=M);d.polygon([(32,28),(24,60),(40,60)],fill=M2);d.rectangle([22,36,42,38],fill=A)
    d.polygon([(22,30),(10,44),(16,46),(26,36)],fill=M);d.polygon([(42,30),(54,42),(48,46),(38,36)],fill=M);d.ellipse([8,42,15,49],fill=sk);d.ellipse([49,40,56,47],fill=sk)
    d.rectangle([54,8,56,60],fill=(120,80,44));d.ellipse([50,2,60,12],fill=A);d.ellipse([53,5,57,9],fill=(255,255,255))
    hat=o.get('hat','hood')
    if hat=='hood':d.polygon([(32,4),(18,22),(22,34),(42,34),(46,22)],fill=M2)
    d.ellipse([24,12,40,30],fill=sk);d.rectangle([27,19,29,21],fill=(30,20,20));d.rectangle([35,19,37,21],fill=(30,20,20));d.rectangle([29,26,35,27],fill=(120,60,50))
    if o.get('beard'):d.polygon([(26,26),(38,26),(32,38)],fill=(235,235,235))
    if hat=='pointy':d.polygon([(32,0),(20,16),(44,16)],fill=M2);d.rectangle([18,14,46,18],fill=M2);d.rectangle([22,12,42,14],fill=A)
    if hat=='crown':
        d.rectangle([24,10,40,15],fill=(230,180,60))
        for x in (24,30,36):d.polygon([(x,10),(x+2,3),(x+4,10)],fill=(230,180,60))
        d.ellipse([30,11,34,15],fill=A)
    if hat=='turban':d.ellipse([22,6,42,19],fill=L(M,60));d.ellipse([29,2,35,9],fill=A)
def warrior(d,M,A,o):
    M2=L(M,-45);sk=(226,180,140)
    if o.get('cape'):d.polygon([(22,24),(8,60),(56,60),(42,24)],fill=A)
    d.rectangle([22,44,30,60],fill=M2);d.rectangle([34,44,42,60],fill=M2);d.rectangle([20,58,31,62],fill=(60,40,30));d.rectangle([33,58,44,62],fill=(60,40,30))
    d.rectangle([20,26,44,46],fill=M);d.rectangle([20,40,44,43],fill=A);d.polygon([(32,28),(26,38),(38,38)],fill=M2)
    d.ellipse([14,24,24,32],fill=A);d.ellipse([40,24,50,32],fill=A);d.rectangle([14,30,20,44],fill=sk);d.rectangle([44,30,50,44],fill=sk)
    if o.get('head')=='jackal':
        d.ellipse([24,8,40,26],fill=M2);d.polygon([(28,12),(26,0),(33,10)],fill=M2);d.polygon([(37,12),(40,0),(33,10)],fill=M2);d.polygon([(32,18),(46,22),(32,28)],fill=M2);d.ellipse([34,13,38,16],fill=(255,220,80));d.rectangle([22,24,42,27],fill=A)
    else:
        d.ellipse([24,10,40,28],fill=sk);d.rectangle([22,8,42,19],fill=M);d.polygon([(32,0),(27,10),(37,10)],fill=A);d.rectangle([26,18,38,21],fill=(30,20,20));d.rectangle([29,20,31,22],fill=(255,230,90));d.rectangle([34,20,36,22],fill=(255,230,90))
    wp=o.get('wp','sword')
    if wp=='sword':d.rectangle([52,6,55,40],fill=(215,222,235));d.rectangle([49,38,58,41],fill=A);d.rectangle([52,41,55,48],fill=(110,70,40))
    elif wp=='spear':d.rectangle([54,4,56,62],fill=(130,90,50));d.polygon([(55,0),(51,10),(59,10)],fill=(215,222,235))
    else:d.arc([44,4,62,58],270,90,fill=(150,95,50),width=3);d.line([(53,6),(53,56)],fill=(235,235,235))
    if wp!='bow':d.ellipse([2,28,20,48],fill=A);d.ellipse([6,32,16,44],fill=M2)
def mummy(d,M,A,o):
    M2=L(M,-40);G=(230,180,60)
    d.rectangle([20,26,44,56],fill=M);d.rectangle([22,54,30,62],fill=M);d.rectangle([34,54,42,62],fill=M);d.rectangle([12,28,20,48],fill=M);d.rectangle([44,28,52,48],fill=M)
    for y in range(28,60,4):d.line([(20,y),(44,y+2)],fill=M2)
    for y in range(30,48,4):d.line([(12,y),(20,y+2)],fill=M2);d.line([(44,y),(52,y+2)],fill=M2)
    d.ellipse([22,6,42,28],fill=M)
    for y in (10,15,20):d.line([(22,y),(42,y+3)],fill=M2)
    d.rectangle([26,15,30,18],fill=(15,10,20));d.rectangle([34,15,38,18],fill=(15,10,20));d.rectangle([27,16,29,17],fill=A);d.rectangle([35,16,37,17],fill=A)
    if o.get('crown'):
        d.rectangle([21,8,43,12],fill=G);d.polygon([(21,8),(25,0),(31,8),(33,0),(39,8),(43,2),(43,8)],fill=G);d.ellipse([30,3,34,8],fill=A);d.rectangle([20,26,44,30],fill=G);d.rectangle([29,30,35,42],fill=A)
def beast(d,M,A,o):
    M2=L(M,-45);k=o.get('k','lion')
    d.polygon([(10,40),(2,30),(8,28),(16,38)],fill=M2);d.ellipse([8,32,46,56],fill=M);d.ellipse([14,44,40,56],fill=L(M,30))
    for x in (12,20,34,42):d.rectangle([x,50,x+5,61],fill=M2)
    if k=='lion':
        d.ellipse([30,8,58,36],fill=A);d.ellipse([34,14,54,34],fill=M);d.ellipse([46,20,58,32],fill=L(M,30));d.polygon([(34,12),(36,5),(41,12)],fill=M2);d.ellipse([47,19,51,23],fill=(255,230,70));d.rectangle([55,25,57,27],fill=(30,20,20))
    else:
        d.polygon([(40,34),(38,4),(47,26)],fill=M2);d.polygon([(50,30),(55,2),(59,28)],fill=M2);d.ellipse([36,20,56,38],fill=M);d.polygon([(52,26),(63,32),(52,37)],fill=A);d.ellipse([46,25,50,29],fill=(255,230,70))
    if o.get('wing'):d.polygon([(22,36),(6,14),(16,34)],fill=A);d.polygon([(30,36),(18,12),(26,34)],fill=A)
def reptile(d,M,A,o):
    M2=L(M,-45);k=o.get('k','snake')
    if k=='croc':
        d.polygon([(2,44),(14,36),(40,36),(48,30),(62,34),(62,40),(48,42),(40,50),(14,50)],fill=M);d.polygon([(2,44),(14,40),(14,48)],fill=M2)
        for x in range(16,38,5):d.polygon([(x,36),(x+2,30),(x+4,36)],fill=M2)
        for x in range(48,62,3):d.polygon([(x,38),(x+1,41),(x+2,38)],fill=(250,250,240))
        d.ellipse([43,28,49,34],fill=(255,230,70));d.rectangle([18,50,24,58],fill=M2);d.rectangle([34,50,40,58],fill=M2)
    else:
        pts=[(32+int(16*math.sin(i/2.2)),60-i*3) for i in range(15)]
        for i,(x,y) in enumerate(pts):
            r=8-i//3;d.ellipse([x-r,y-r,x+r,y+r],fill=M if i%2 else L(M,22))
            if i%3==0:d.ellipse([x-2,y-1,x+2,y+3],fill=A)
        hx,hy=pts[-1];heads=[(hx,hy)]
        if k=='hydra':
            heads=[(12,16),(32,8),(52,16)]
            for X,Y in heads:d.line([(32,44),(X,Y+4)],fill=M,width=6)
        for X,Y in heads:
            if k=='hood':d.polygon([(X-14,Y+6),(X,Y-8),(X+14,Y+6),(X+8,Y+16),(X-8,Y+16)],fill=A)
            d.ellipse([X-8,Y-6,X+8,Y+6],fill=L(M,15));d.ellipse([X+1,Y-4,X+5,Y],fill=(255,230,70));d.line([(X+8,Y+2),(X+13,Y+3)],fill=(220,40,50))
def insect(d,M,A,o):
    M2=L(M,-45);k=o.get('k','scarab');s=1.25 if o.get('big') else 1
    if k=='scarab':
        for y in (30,38,46):d.line([(14,y),(3,y+7)],fill=M2,width=2);d.line([(50,y),(61,y+7)],fill=M2,width=2)
        d.ellipse([14,24,50,60],fill=M);d.line([(32,26),(32,60)],fill=M2);d.arc([16,26,48,58],200,340,fill=A);d.ellipse([22,12,42,30],fill=A)
        d.polygon([(26,16),(21,4),(30,13)],fill=M2);d.polygon([(38,16),(43,4),(34,13)],fill=M2);d.ellipse([27,19,31,23],fill=(255,60,60));d.ellipse([33,19,37,23],fill=(255,60,60));d.ellipse([28,34,36,44],fill=A)
        if o.get('big'):d.polygon([(14,34),(0,18),(8,44)],fill=(*A,255));d.polygon([(50,34),(63,18),(56,44)],fill=A)
    else:
        for y in (36,42,48):d.line([(16,y),(4,y+8)],fill=M2,width=2);d.line([(48,y),(60,y+8)],fill=M2,width=2)
        d.ellipse([16,34,48,58],fill=M)
        for i,(x,y) in enumerate([(32,34),(44,26),(46,14),(38,6),(28,8)]):d.ellipse([x-5+i,y-5,x+5-i//2,y+5],fill=M if i%2 else L(M,20))
        d.polygon([(24,6),(34,10),(28,16)],fill=A);d.ellipse([2,22,16,34],fill=A);d.ellipse([48,22,62,34],fill=A);d.ellipse([26,40,32,46],fill=(255,60,60))
def bird(d,M,A,o):
    M2=L(M,-45);k=o.get('k','falcon')
    if k=='ibis':
        d.rectangle([28,50,30,62],fill=(60,40,40));d.rectangle([36,50,38,62],fill=(60,40,40));d.ellipse([16,32,50,54],fill=M);d.polygon([(44,36),(36,12),(42,12),(50,36)],fill=M);d.ellipse([33,6,46,18],fill=M)
        d.polygon([(44,10),(60,16),(56,19),(44,15)],fill=A);d.ellipse([36,9,40,13],fill=(30,20,20));d.polygon([(18,38),(34,44),(16,56)],fill=A);d.polygon([(16,44),(4,58),(20,52)],fill=A)
    else:
        W_=A if k=='phoenix' else M2
        d.polygon([(32,30),(2,8),(6,34),(16,40)],fill=W_);d.polygon([(32,30),(62,8),(58,34),(48,40)],fill=W_)
        for x,y in ((10,18),(8,26),(14,32)):d.line([(32,32),(x,y)],fill=M2);d.line([(32,32),(64-x,y)],fill=M2)
        if k=='phoenix':
            for x in (24,32,40):d.polygon([(x,50),(x-6,63),(x+6,63)],fill=A);d.polygon([(x,50),(x-3,60),(x+3,60)],fill=(255,240,170))
        d.ellipse([22,26,42,56],fill=M);d.ellipse([24,12,40,30],fill=M);d.polygon([(30,22),(34,22),(32,32)],fill=(240,200,60));d.ellipse([26,16,29,19],fill=(255,240,100));d.ellipse([35,16,38,19],fill=(255,240,100));d.rectangle([26,52,29,60],fill=(240,200,60));d.rectangle([35,52,38,60],fill=(240,200,60))
        if k=='phoenix':d.polygon([(28,12),(32,0),(36,12)],fill=A)
def golem(d,M,A,o):
    M2=L(M,-45)
    d.rectangle([20,44,30,62],fill=M2);d.rectangle([34,44,44,62],fill=M2);d.rectangle([16,24,48,48],fill=M);d.rectangle([22,30,42,42],fill=M2);d.line([(22,36),(42,36)],fill=A)
    d.rectangle([4,26,16,52],fill=M);d.rectangle([48,26,60,52],fill=M);d.rectangle([2,50,18,60],fill=M2);d.rectangle([46,50,62,60],fill=M2)
    d.rectangle([22,6,42,26],fill=M);d.rectangle([26,13,30,18],fill=A);d.rectangle([34,13,38,18],fill=A);d.line([(24,22),(40,22)],fill=M2)
    for x,y in ((28,32),(34,34),(30,38)):d.rectangle([x,y,x+2,y+2],fill=A)
    d.line([(8,30),(12,42)],fill=M2);d.line([(52,32),(56,46)],fill=M2)
    if o.get('big'):d.polygon([(16,24),(10,16),(22,22)],fill=M);d.polygon([(48,24),(54,16),(42,22)],fill=M)
def spirit(d,M,A,o):
    M2=L(M,-40);k=o.get('k','genie')
    if k=='flame':
        d.polygon([(32,0),(48,24),(52,44),(32,62),(12,44),(16,24)],fill=M);d.polygon([(32,14),(42,30),(44,46),(32,58),(20,46),(22,30)],fill=A);d.polygon([(32,30),(38,42),(32,54),(26,42)],fill=(255,250,200));d.ellipse([24,26,29,32],fill=(30,10,10));d.ellipse([35,26,40,32],fill=(30,10,10))
        if o.get('big'):d.polygon([(8,30),(16,50),(4,56)],fill=M);d.polygon([(56,30),(48,50),(60,56)],fill=M)
    else:
        d.polygon([(22,40),(42,40),(38,52),(46,62),(28,58),(18,62),(26,50)],fill=M2);d.ellipse([20,24,44,48],fill=M);d.rectangle([14,34,50,40],fill=L(M,30))
        for x in (14,20,44,50):d.rectangle([x,34,x+2,40],fill=A)
        d.ellipse([25,10,39,26],fill=L(M,45));d.ellipse([22,4,42,16],fill=A);d.ellipse([29,5,35,11],fill=(255,255,255));d.rectangle([28,17,30,19],fill=(20,20,40));d.rectangle([34,17,36,19],fill=(20,20,40))
def seal(d,M,A,o):
    g=o.get('g',0);d.ellipse([6,6,58,58],fill=M);d.ellipse([12,12,52,52],fill=L(M,-55));d.ellipse([14,14,50,50],outline=A)
    G=[lambda:(d.ellipse([20,26,44,38],outline=A,width=2),d.ellipse([28,28,36,36],fill=A)),lambda:(d.ellipse([24,14,40,30],outline=A,width=3),d.rectangle([30,28,34,50],fill=A),d.rectangle([22,36,42,40],fill=A)),
       lambda:d.polygon([(32,14),(50,46),(14,46)],outline=A),lambda:(d.line([(18,20),(46,44)],fill=A,width=3),d.line([(46,20),(18,44)],fill=A,width=3)),lambda:[d.arc([16+i*4,16+i*4,48-i*4,48-i*4],0,300,fill=A,width=2) for i in range(4)]]
    G[g%5]()
SP={'dragon':dragon,'mage':mage,'warrior':warrior,'mummy':mummy,'beast':beast,'reptile':reptile,'insect':insect,'bird':bird,'golem':golem,'spirit':spirit,'seal':seal}
# ---------- ícones de mágicas/armadilhas ----------
def gg(a,b):return lambda d,A,C:None
I={
'flask':lambda d,A,C:(d.polygon([(26,8),(38,8),(38,22),(50,50),(44,58),(20,58),(14,50),(26,22)],fill=C),d.polygon([(22,40),(42,40),(50,50),(44,58),(20,58),(14,50)],fill=A),d.rectangle([24,4,40,10],fill=(150,100,60))),
'flame':lambda d,A,C:(d.polygon([(32,4),(50,30),(46,52),(32,60),(18,52),(14,30),(26,24)],fill=A),d.polygon([(32,22),(42,38),(38,54),(32,58),(26,54),(22,38)],fill=C),d.polygon([(32,38),(36,48),(32,56),(28,48)],fill=(255,250,210))),
'scroll':lambda d,A,C:(d.rectangle([14,12,50,52],fill=C),*[d.ellipse(b,fill=A) for b in ([8,8,20,18],[8,46,20,56],[44,8,56,18],[44,46,56,56])],*[d.line([(20,y),(44,y)],fill=A,width=2) for y in (20,27,34,41)]),
'cyclone':lambda d,A,C:[d.arc([6+i*5,6+i*5,58-i*5,58-i*5],20+i*40,300+i*40,fill=A if i%2 else C,width=4) for i in range(5)],
'ankh':lambda d,A,C:(d.ellipse([10,10,54,54],fill=C),d.ellipse([22,6,42,30],outline=A,width=5),d.rectangle([29,28,35,58],fill=A),d.rectangle([18,36,46,42],fill=A)),
'quake':lambda d,A,C:(d.polygon([(30,4),(36,22),(28,30),(38,46),(32,62),(26,44),(34,32),(26,20)],fill=(20,10,10)),d.polygon([(4,50),(16,36),(24,52)],fill=A),d.polygon([(44,52),(54,34),(62,52)],fill=A),d.rectangle([0,56,63,63],fill=C)),
'gust':lambda d,A,C:[d.arc([4+i*2,10+i*10,50,30+i*10],200,20,fill=A if i%2 else C,width=4) for i in range(4)],
'moon':lambda d,A,C:(d.ellipse([12,8,52,56],fill=A),d.ellipse([24,4,62,50],fill=C)),
'gem':lambda d,A,C:(d.polygon([(32,6),(54,24),(32,58),(10,24)],fill=A),d.polygon([(32,6),(54,24),(32,24)],fill=C),d.polygon([(32,24),(54,24),(32,58)],fill=L(A,-50))),
'drop':lambda d,A,C:(d.polygon([(32,4),(50,34),(46,52),(32,60),(18,52),(14,34)],fill=A),d.ellipse([22,36,30,46],fill=C)),
'scales':lambda d,A,C:(d.rectangle([30,8,34,56],fill=A),d.rectangle([14,54,50,58],fill=A),d.line([(10,16),(54,16)],fill=A,width=3),d.polygon([(4,34),(18,34),(11,20)],fill=C),d.polygon([(46,34),(60,34),(53,20)],fill=C)),
'blood':lambda d,A,C:(d.polygon([(32,6),(46,32),(32,52),(18,32)],fill=(190,20,40)),d.ellipse([12,52,52,62],outline=(190,20,40),width=2),d.ellipse([26,30,32,38],fill=(255,140,150))),
'book':lambda d,A,C:(d.rectangle([10,10,54,54],fill=C),d.rectangle([14,14,50,50],fill=A),d.ellipse([22,22,42,42],outline=C,width=3),d.ellipse([29,29,35,35],fill=C)),
'sword':lambda d,A,C:(d.polygon([(30,2),(34,2),(36,40),(28,40)],fill=(225,230,240)),d.rectangle([18,38,46,44],fill=A),d.rectangle([29,44,35,58],fill=(120,70,40)),d.ellipse([27,56,37,64],fill=A)),
'shield':lambda d,A,C:(d.polygon([(10,8),(54,8),(54,36),(32,60),(10,36)],fill=A),d.polygon([(32,12),(50,12),(50,34),(32,54)],fill=C),d.ellipse([24,20,40,36],fill=A)),
'amulet':lambda d,A,C:(d.line([(16,4),(32,28),(48,4)],fill=A,width=2),d.ellipse([16,24,48,56],fill=A),d.ellipse([22,30,42,50],fill=C),d.ellipse([29,37,35,43],fill=(255,255,255))),
'altar':lambda d,A,C:(d.polygon([(8,56),(16,32),(48,32),(56,56)],fill=C),d.rectangle([12,28,52,34],fill=A),d.polygon([(32,4),(42,22),(32,28),(22,22)],fill=(255,150,40)),d.polygon([(32,12),(37,22),(32,26),(27,22)],fill=(255,240,150))),
'obelisk':lambda d,A,C:(d.polygon([(32,2),(42,14),(46,60),(18,60),(22,14)],fill=C),d.polygon([(32,2),(42,14),(22,14)],fill=A),d.ellipse([26,26,38,36],fill=A),d.ellipse([30,29,34,33],fill=(20,10,30))),
'mirror':lambda d,A,C:(d.ellipse([12,4,52,50],fill=A),d.ellipse([16,8,48,46],fill=C),d.line([(22,40),(40,14)],fill=(255,255,255),width=3),d.rectangle([29,50,35,62],fill=A)),
'cylinder':lambda d,A,C:(d.rectangle([14,14,50,50],fill=C),d.ellipse([14,8,50,22],fill=A),d.ellipse([14,42,50,58],fill=C),d.ellipse([20,10,44,20],fill=(10,10,20))),
'ring':lambda d,A,C:(d.ellipse([8,8,56,56],outline=A,width=7),d.ellipse([14,14,50,50],outline=C,width=2),*[d.polygon([(32+26*math.cos(a),32+26*math.sin(a)),(32+34*math.cos(a+.2),32+34*math.sin(a+.2)),(32+34*math.cos(a-.2),32+34*math.sin(a-.2))],fill=(255,200,80)) for a in [i*math.pi/4 for i in range(8)]]),
'pit':lambda d,A,C:(d.ellipse([4,20,60,56],fill=A),d.ellipse([10,26,54,52],fill=(8,4,14)),d.ellipse([18,32,46,48],fill=(0,0,0)),d.polygon([(20,10),(26,26),(14,22)],fill=C)),
'wave':lambda d,A,C:[d.arc([-10+i*16,14+k*14,22+i*16,42+k*14],180,360,fill=A if k%2 else C,width=5) for k in range(3) for i in range(5)],
'cage':lambda d,A,C:(d.arc([8,2,56,40],180,360,fill=A,width=4),*[d.line([(x,22),(x,58)],fill=A,width=3) for x in (12,22,32,42,52)],d.rectangle([8,54,56,60],fill=C),d.ellipse([26,34,38,48],fill=C)),
'ward':lambda d,A,C:(d.polygon([(32,4),(40,24),(60,24),(44,36),(50,58),(32,44),(14,58),(20,36),(4,24),(24,24)],fill=A),d.ellipse([24,22,40,38],fill=C)),
'scarab':lambda d,A,C:(d.ellipse([14,20,50,58],fill=C),d.line([(32,22),(32,58)],fill=A),d.ellipse([22,8,42,24],fill=A),d.polygon([(26,10),(20,0),(30,8)],fill=A),d.polygon([(38,10),(44,0),(34,8)],fill=A),*[d.line([(14,y),(4,y+6)],fill=A,width=2) for y in (30,40,50)]),
'dust':lambda d,A,C:[d.ellipse([x,y,x+r,y+r],fill=A if (x+y)%2 else C) for x,y,r in ((8,40,14),(22,26,18),(38,36,16),(14,14,10),(44,12,12),(30,48,12))],
'sun':lambda d,A,C:(*[d.polygon([(32+16*math.cos(a-.15),32+16*math.sin(a-.15)),(32+30*math.cos(a),32+30*math.sin(a)),(32+16*math.cos(a+.15),32+16*math.sin(a+.15))],fill=A) for a in [i*math.pi/6 for i in range(12)]],d.ellipse([18,18,46,46],fill=C))}
FS={'Fogo':lambda d:(d.polygon([(0,63),(14,30),(24,16),(34,16),(44,30),(63,63)],fill=(40,14,10)),d.polygon([(24,16),(34,16),(30,26)],fill=(255,170,50)),d.polygon([(28,20),(32,34),(22,50),(30,63),(38,63),(36,44)],fill=(255,100,20)),d.ellipse([-10,54,74,70],fill=(255,90,20))),
'Água':lambda d:(d.ellipse([-6,38,70,70],fill=(40,150,200)),d.ellipse([6,44,58,64],fill=(120,220,230)),*[(d.rectangle([x,24,x+2,44],fill=(120,80,40)),d.polygon([(x+1,24),(x-9,26),(x+1,20),(x+11,26)],fill=(40,140,60))) for x in (10,48)]),
'Vento':lambda d:(d.polygon([(0,63),(0,48),(20,40),(40,50),(63,42),(63,63)],fill=(210,180,110)),*[d.arc([4+i*6,8+i*12,50+i*4,30+i*12],200,350,fill=(255,255,255),width=3) for i in range(4)]),
'Terra':lambda d:(d.polygon([(0,63),(0,14),(14,10),(16,63)],fill=(110,66,34)),d.polygon([(63,63),(63,16),(50,10),(46,63)],fill=(130,78,40)),d.polygon([(16,63),(24,50),(40,50),(46,63)],fill=(190,140,80)),d.rectangle([28,30,34,50],fill=(90,50,26))),
'Luz':lambda d:(*[d.rectangle([x,16,x+6,58],fill=(250,240,210)) for x in (8,50)],d.rectangle([4,12,62,18],fill=(230,200,120)),d.ellipse([22,14,42,34],fill=(255,250,200)),d.rectangle([0,56,63,63],fill=(220,190,110))),
'Trevas':lambda d:(*[(d.rectangle([x,36,x+10,56],fill=(60,50,80)),d.polygon([(x-2,36),(x+5,26),(x+12,36)],fill=(80,66,100))) for x in (6,26,46)],d.polygon([(30,2),(34,2),(36,30),(28,30)],fill=(120,100,160)),d.rectangle([0,56,63,63],fill=(30,20,50)))}
# ---------- catálogo ----------
cards=[]
def E(on,t,**k):return dict(on=on,t=t,**k)
def mon(i,n,lv,a,d_,race,attr,rar,ef,tx,sp,pal,fusion=None,**o):
    cards.append(dict(id=i,name=n,type='monster',level=lv,attack=a,defense=d_,race=race,attr=attr,rarity=rar,price=PR[rar]*(2 if lv>=7 else 1),ef=ef,text=tx,fusion=fusion,_sp=dict(k='mon',sp=sp,pal=pal,o=o)))
def spl(i,n,sub,eff,rar,tx,ic,pal,bgc,ef=None,field=None):
    cards.append(dict(id=i,name=n,type='spell',sub=sub,rarity=rar,price=PR[rar],effect=eff,ef=ef,text=tx,field=field,attr=field['a'] if field else None,_sp=dict(k='field',attr=field['a']) if field else dict(k='icon',ic=ic,pal=pal,bg=bgc)))
def trp(i,n,t,tr,rar,tx,ic,pal,bgc):
    cards.append(dict(id=i,name=n,type='trap',rarity=rar,price=PR[rar],effect=dict(t=t,tr=tr),text=tx,_sp=dict(k='icon',ic=ic,pal=pal,bg=bgc)))
mon('M001','Escaravelho Dourado',2,800,600,'Inseto','Terra','C',E('die','draw',v=1),'Ao ser destruído: compre 1 carta.','insect',('#d9a93c','#2a6f6a'))
mon('M002','Chacal do Deserto',3,1200,800,'Fera','Terra','C',None,'Caçador ágil das dunas.','beast',('#8a6a3a','#d9c48a'),k='jackal')
mon('M003','Escorpião Venenoso',2,900,500,'Inseto','Terra','C',E('hit','burn',v=300),'Ao causar dano em batalha: 300 de dano extra.','insect',('#5a3a28','#c04a2a'),k='scorp')
mon('M004','Serpente das Dunas',3,1300,900,'Réptil','Terra','C',None,'Esconde-se sob a areia quente.','reptile',('#c9a64a','#7a4a2a'))
mon('M005','Múmia Errante',3,1100,1000,'Morto-vivo','Trevas','C',E('die','burn',v=300),'Ao ser destruído: 300 de dano ao rival.','mummy',('#d8cfb0','#a050e0'))
mon('M006','Escriba de Pedra',3,1000,1500,'Mago','Luz','C',E('sum','heal',v=500),'Ao invocar: recupere 500 LP.','mage',('#e8e0c0','#4a8ac0'),hat='turban')
mon('M007','Sacerdote do Sol',4,1500,1300,'Mago','Luz','U',E('start','heal',v=200),'No início do seu turno: recupere 200 LP.','mage',('#f1cf4a','#c0392b'),hat='crown')
mon('M008','Aprendiz de Feitiçaria',2,700,700,'Mago','Trevas','C',E('sum','burn',v=200),'Ao invocar: 200 de dano ao rival.','mage',('#5a3a8a','#b070e0'),hat='pointy')
mon('M009','Guarda do Faraó',4,1700,1200,'Guerreiro','Terra','U',None,'Leal defensor do palácio.','warrior',('#b5835a','#d9a93c'),wp='spear')
mon('M010','Soldado de Bronze',3,1300,1000,'Guerreiro','Fogo','C',None,'Armadura forjada em chamas.','warrior',('#c0713a','#e8531e'),wp='sword')
mon('M011','Arqueira do Nilo',4,1600,1000,'Guerreiro','Vento','U',E('hit','burn',v=400),'Ao causar dano em batalha: 400 de dano extra.','warrior',('#3a8a6a','#e8d86a'),wp='bow',cape=1)
mon('M012','Falcão de Hórus',3,1400,700,'Ave','Vento','C',None,'Mensageiro dos deuses.','bird',('#8a6a4a','#e8d86a'))
mon('M013','Íbis Sagrado',2,800,1000,'Ave','Luz','C',E('sum','heal',v=500),'Ao invocar: recupere 500 LP.','bird',('#f0eadc','#2a2a3a'),k='ibis')
mon('M014','Crocodilo do Rio',4,1800,1000,'Réptil','Água','U',None,'Senhor das águas turvas.','reptile',('#3a7a5a','#d9c48a'),k='croc')
mon("M015","Naga d'Água",3,1200,1300,'Réptil','Água','C',E('start','heal',v=200),'No início do seu turno: recupere 200 LP.','reptile',('#2a7aa8','#8ae0e0'),k='hood')
mon('M016','Espírito da Brasa',3,1300,700,'Espírito','Fogo','C',E('die','burn',v=500),'Ao ser destruído: 500 de dano ao rival.','spirit',('#e8531e','#ffd84a'),k='flame')
mon('M017','Gênio da Lâmpada',4,1500,1500,'Espírito','Vento','U',E('sum','draw',v=1),'Ao invocar: compre 1 carta.','spirit',('#3fb86a','#f1cf4a'))
mon('M018','Golem de Argila',4,1400,2000,'Golem','Terra','C',None,'Lento, porém resistente.','golem',('#b5835a','#ffd84a'))
mon('M019','Estátua Viva',5,2000,1800,'Golem','Terra','U',None,'Desperta com runas antigas.','golem',('#8a8a94','#6ae0e0'))
mon('M020','Dragãozinho das Dunas',3,1300,900,'Dragão','Fogo','C',E('pas','bonusR',r='Dragão',v=200),'Seus outros Dragões ganham 200 ATK.','dragon',('#d9803a','#e8531e'),w=0)
mon('M021','Leão de Sekhmet',5,2100,1500,'Fera','Fogo','R',E('sum','burn',v=500),'Ao invocar: 500 de dano ao rival.','beast',('#d9a03a','#c0391b'))
mon('M022','Cobra Rainha',5,1900,1600,'Réptil','Trevas','U',E('pas','pierce'),'Dano perfurante contra monstros em DEF.','reptile',('#4a2a7a','#d94aa0'),k='hood')
mon('M023','Cavaleiro de Osíris',5,2000,1700,'Guerreiro','Luz','U',E('pas','aura',v=200),'Seus outros monstros ganham 200 ATK.','warrior',('#e8e0d0','#4a8ac0'),wp='sword',cape=1)
mon('M024','Dragão do Oásis',6,2300,2000,'Dragão','Água','R',E('sum','heal',v=1000),'Ao invocar: recupere 1000 LP.','dragon',('#2a8ab8','#8ae0d0'))
mon('M025','Faraó Esquecido',6,2200,1800,'Morto-vivo','Trevas','R',E('sum','revive'),'Ao invocar: reviva um monstro de nível ≤4 do seu cemitério.','mummy',('#8a7a5a','#d9a93c'),crown=1)
mon('M026','Sacerdotisa de Ísis',5,1800,2000,'Mago','Luz','R',E('start','heal',v=400),'No início do seu turno: recupere 400 LP.','mage',('#4a8ac0','#f1cf4a'),hat='crown',dk=1)
mon('M027','Titã de Arenito',6,2400,2200,'Golem','Terra','R',E('die','burn',v=800),'Ao ser destruído: 800 de dano ao rival.','golem',('#c9965a','#ff8a3a'),big=1)
mon('M028','Fênix do Nilo',6,2300,1600,'Ave','Fogo','R',E('die','revive'),'Ao ser destruído: reviva um monstro de nível ≤4.','bird',('#e8531e','#ffd84a'),k='phoenix')
mon('M029','Dragão Solar',7,2800,2200,'Dragão','Luz','SR',E('pas','bonusA',r='Luz',v=300),'Seus outros monstros Luz ganham 300 ATK.','dragon',('#f1cf4a','#ff8a3a'))
mon('M030','Dragão das Tempestades',7,2600,2000,'Dragão','Vento','SR',E('sum','pos'),'Ao invocar: monstros do rival mudam para DEF.','dragon',('#4aa88a','#d0f0e0'))
mon('M031','Anúbis, Juiz dos Mortos',7,2500,2400,'Morto-vivo','Trevas','SR',E('sum','kill'),'Ao invocar: destrua o monstro mais forte do rival.','warrior',('#26263a','#d9a93c'),head='jackal',wp='spear',cape=1)
mon('M032','Colosso de Mármore',7,2700,2600,'Golem','Terra','SR',E('pas','pierce'),'Dano perfurante contra monstros em DEF.','golem',('#e8e4dc','#6ae0e0'),big=1)
mon('M033','Mago-Rei de Mênfis',7,2700,2100,'Mago','Trevas','SR',E('sum','draw',v=2),'Ao invocar: compre 2 cartas.','mage',('#2a1a5a','#d9a93c'),hat='crown',beard=1)
mon('M034','Hidra do Pântano',8,3000,2000,'Réptil','Água','UR',E('hit','burn',v=600),'Ao causar dano em batalha: 600 de dano extra.','reptile',('#2a6a4a','#8ae0a0'),k='hydra')
mon('M035','Dragão Eclipse',8,3200,2500,'Dragão','Trevas','UR',E('sum','kill'),'Ao invocar: destrua o monstro mais forte do rival.','dragon',('#3a1a6a','#d94aa0'))
mon('M036','Devorador de Areia',8,2900,2700,'Inseto','Terra','UR',E('pas','debuff',v=300),'Monstros do rival perdem 300 ATK.','insect',('#7a5a2a','#ffd84a'),big=1)
mon('F001','Dragão Crepúsculo',10,3800,3000,'Dragão','Luz','UR',E('sum','burn',v=1000),'Fusão: Dragão Solar + Dragão Eclipse. Ao invocar: 1000 de dano.','dragon',('#c9a0f0','#ffe08a'),fusion=['M029','M035'],h=3)
mon('F002','Quimera do Deserto',8,3000,2400,'Fera','Fogo','SR',E('pas','pierce'),'Fusão: Leão de Sekhmet + Cobra Rainha. Dano perfurante.','beast',('#d9a03a','#4a2a7a'),fusion=['M021','M022'],wing=1)
mon('F003','Colosso Dourado',8,2900,3000,'Golem','Terra','SR',E('die','burn',v=1000),'Fusão: 2 monstros Golem. Ao ser destruído: 1000 de dano.','golem',('#f1cf4a','#8a5a2a'),fusion=['@Golem','@Golem'],big=1)
mon('F004','Serafim das Águas',7,2700,2500,'Dragão','Água','SR',E('start','heal',v=500),'Fusão: Naga d\'Água + Dragão do Oásis. Início do turno: +500 LP.','dragon',('#bfe8ff','#2a8ab8'),fusion=['M015','M024'])
mon('F005','Senhor das Cinzas',8,3100,2000,'Espírito','Fogo','SR',E('sum','kill'),'Fusão: 3 monstros Fogo. Ao invocar: destrua o monstro mais forte do rival.','spirit',('#c0391b','#ffd84a'),fusion=['#Fogo','#Fogo','#Fogo'],k='flame',big=1)
mon('F006','Cavaleiro Dracônico',8,3000,2600,'Dragão','Luz','SR',E('pas','aura',v=300),'Fusão: 1 Dragão + 1 Guerreiro. Seus outros monstros ganham 300 ATK.','warrior',('#e8e0d0','#d9803a'),fusion=['@Dragão','@Guerreiro'],wp='sword',cape=1)
mon('R01','Faraó Selado',3,1000,1000,'Espírito','Luz','UR',None,'Reúna os 5 Selos do Faraó na mão para vencer o duelo.','seal',('#d9a93c','#fff2a0'),g=0)
for k,(i,n) in enumerate([('R02','Selo da Mão Direita'),('R03','Selo da Mão Esquerda'),('R04','Selo do Pé Direito'),('R05','Selo do Pé Esquerdo')]):
    mon(i,n,1,200,300,'Espírito','Luz','R',None,'Um dos 5 Selos do Faraó. Reúna todos na mão para vencer.','seal',('#7a5a2a','#ffd84a'),g=k+1)
nv=lambda a,b:(a,b)
spl('S001','Poção do Nilo','normal',dict(t='heal',v=1000),'C','Recupere 1000 LP.','flask',((90,190,255),(230,250,255)),((10,40,90),(60,140,200)))
spl('S002','Chama Sagrada','normal',dict(t='burn',v=800),'U','Cause 800 de dano ao rival.','flame',((255,120,30),(255,220,80)),((60,10,8),(200,70,20)))
spl('S003','Sabedoria do Escriba','normal',dict(t='draw',v=2),'U','Compre 2 cartas.','scroll',((190,140,60),(245,230,180)),((70,45,20),(160,110,50)))
spl('S004','Tempestade de Areia','normal',dict(t='destroy'),'R','Destrua 1 monstro do rival à sua escolha.','cyclone',((240,200,120),(190,140,70)),((70,45,20),(200,150,80)))
spl('S005','Rito de Renascimento','normal',dict(t='revive'),'R','Reviva 1 monstro do seu cemitério.','ankh',((255,230,120),(80,50,140)),((30,10,60),(110,60,170)))
spl('S006','Fúria do Deserto','normal',dict(t='bhole'),'R','Destrua todos os monstros do campo.','quake',((160,110,60),(70,40,20)),((60,20,10),(200,90,40)))
spl('S007','Vendaval Purificador','normal',dict(t='storm'),'R','Destrua todas as mágicas/armadilhas do campo.','gust',((200,250,230),(90,200,170)),((20,80,80),(150,230,210)))
spl('S008','Lua Velada','normal',dict(t='def'),'U','Vire 1 monstro do rival para DEF.','moon',((230,225,255),(40,20,80)),((15,8,40),(80,50,130)))
spl('S009','Fusão Real','normal',dict(t='fuse'),'R','Invoque uma Fusão do Extra Deck usando monstros da mão/campo.','gem',((190,120,255),(255,230,255)),((40,10,80),(130,60,200)))
spl('S010','Maré Curativa','normal',dict(t='healA',a='Água',v=500),'U','Recupere 500 LP por monstro Água que você controla.','drop',((70,180,255),(220,250,255)),((10,40,100),(50,150,220)))
spl('S011','Chuva de Brasas','normal',dict(t='burnA',a='Fogo',v=400),'U','400 de dano ao rival por monstro Fogo que você controla.','flame',((255,90,20),(255,200,60)),((70,10,8),(220,80,20)))
spl('S012','Julgamento de Anúbis','normal',dict(t='purge',v=2200),'R','Destrua todos os monstros com ATK 2200 ou mais.','scales',((230,200,100),(120,90,40)),((20,10,40),(90,60,130)))
spl('S013','Pacto de Sangue','normal',dict(t='pact'),'SR','Pague 1000 LP e compre 3 cartas.','blood',((190,20,40),(255,140,150)),((30,5,15),(120,20,50)))
spl('S014','Chamado Ancestral','normal',dict(t='tutor',r='Morto-vivo'),'U','Adicione à mão o Morto-vivo mais forte do deck.','book',((120,60,170),(230,210,255)),((25,10,50),(100,50,150)))
spl('S015','Sopro Sagrado','normal',dict(t='bounce'),'U','Devolva 1 monstro do rival à mão dele.','gust',((255,255,255),(150,210,255)),((20,70,110),(120,200,240)))
spl('S016','Lâmina do Sol','equip',dict(t='equip',a=600,d=0),'U','Equipamento: +600 ATK.','sword',((255,200,70),(255,240,170)),((80,50,10),(230,170,40)))
spl('S017','Escudo de Escaravelho','equip',dict(t='equip',a=0,d=700),'C','Equipamento: +700 DEF.','shield',((60,160,150),(230,200,90)),((10,50,50),(50,140,130)))
spl('S018','Amuleto do Dragão','equip',dict(t='equip',a=500,d=500),'R','Equipamento: +500 ATK e DEF.','amulet',((230,180,60),(180,40,60)),((50,10,20),(160,50,60)))
spl('S019','Altar do Sol','cont',dict(t='cont'),'R','Contínua: no início do seu turno, recupere 300 LP.','altar',((255,220,120),(120,70,40)),((60,30,10),(220,150,50)),ef=E('start','heal',v=300))
spl('S020','Obelisco Sombrio','cont',dict(t='cont'),'R','Contínua: no início do seu turno, 300 de dano ao rival.','obelisk',((150,90,220),(50,30,90)),((15,8,35),(70,40,110)),ef=E('start','burn',v=300))
FD=[('FD01','Forja Vulcânica','Fogo','Água','fire'),('FD02','Oásis Sagrado','Água','Fogo','water'),('FD03','Planície dos Ventos','Vento','Terra','wind'),('FD04','Cânion de Pedra','Terra','Vento','earth'),('FD05','Templo Radiante','Luz','Trevas','light'),('FD06','Necrópole Eterna','Trevas','Luz','dark')]
for i,n,a,x,b in FD:spl(i,n,'field',dict(t='field'),'R',f'Campo: monstros {a} ganham 400 ATK/DEF; monstros {x} perdem 300 ATK.',None,None,None,field=dict(a=a,x=x,bg=b))
trp('T001','Espelho de Areia','mir','atk','R','Quando o rival atacar: destrua todos os monstros dele em ATK.','mirror',((230,200,130),(110,160,200)),((60,40,20),(190,140,70)))
trp('T002','Cilindro de Obsidiana','cyl','atk','U','Anula 1 ataque; o atacante sofre dano igual ao seu ATK.','cylinder',((120,90,160),(30,20,50)),((20,8,40),(80,40,120)))
trp('T003','Anel Funerário','ring','atk','R','Destrói o atacante; ambos sofrem dano igual ao ATK dele.','ring',((200,160,70),(90,50,120)),((40,10,40),(130,50,90)))
trp('T004','Fosso Sem Fundo','pit','sum','U','Quando o rival invocar monstro com ATK ≥1500: destrua-o.','pit',((150,100,50),(60,30,20)),((50,30,10),(150,100,50)))
trp('T005','Cheia do Nilo','flood','sum','SR','Quando o rival invocar: destrua todos os monstros.','wave',((70,170,240),(200,240,255)),((8,30,100),(40,130,210)))
trp('T006','Prisão de Cristal','jail','sum','U','Quando o rival invocar: destrua o monstro invocado.','cage',((190,230,255),(60,100,170)),((20,40,90),(110,170,230)))
trp('T007','Contrafeitiço Real','neg','resp','R','Em corrente: anula a armadilha anterior.','ward',((255,220,110),(150,60,60)),((60,15,15),(190,70,60)))
trp('T008','Selo Anti-Magia','spn','spl','R','Anula a ativação de uma mágica do rival.','ward',((160,110,255),(30,15,70)),((20,8,50),(90,50,160)))
trp('T009','Maldição do Escaravelho','curse','sum','U','Quando o rival invocar: o monstro perde 800 ATK permanentemente.','scarab',((80,200,120),(30,60,50)),((10,40,30),(50,130,90)))
trp('T010','Poeira Cegante','dust','atk','U','Anula 1 ataque e vira o atacante para DEF.','dust',((240,200,140),(190,140,80)),((70,45,20),(200,150,80)))
# ---------- sprites ----------
def compose(c):
    s=c['_sp'];seed=sum(map(ord,c['id']))*31
    if s['k']=='field':
        im=bg(s['attr'],seed);FS[s['attr']](ImageDraw.Draw(im));return shade(im)
    sub=Image.new('RGBA',(64,64));d=ImageDraw.Draw(sub)
    if s['k']=='mon':
        base=bg(c['attr'],seed);M,A=H(s['pal'][0]),H(s['pal'][1]);o=dict(s['o'])
        if s['sp']=='beast' and o.get('k')=='scorp':SP['insect'](d,M,A,dict(k='scorp'))
        else:SP[s['sp']](d,M,A,o)
        gc=AC[c['attr']]
    else:
        base=grad(*s['bg']);A,C=s['pal'];I[s['ic']](d,A,C);gc=A
    sub=shade(sub);out=Image.alpha_composite(base,glow(sub,gc));out.alpha_composite(outline(sub));out.alpha_composite(sub)
    if c['rarity'] in ('SR','UR'):
        r=random.Random(seed);dd=ImageDraw.Draw(out)
        for _ in range(7):x,y=r.randint(3,60),r.randint(3,60);dd.line([(x-2,y),(x+2,y)],fill=(255,255,255,230));dd.line([(x,y-2),(x,y+2)],fill=(255,255,255,230))
    return out
for c in cards:compose(c).save(f"assets/cards/{c['id']}.png",optimize=True)
out=[{k:v for k,v in c.items() if not k.startswith('_') and v is not None} for c in cards]
json.dump(out,open('data/cards.json','w'),ensure_ascii=False,separators=(',',':'))
def fit(spec,filler):
    l=[k for k,n in spec.items() for _ in range(n)][:40];cnt={}
    for k in l:cnt[k]=cnt.get(k,0)+1
    i=0
    while len(l)<40:
        f=filler[i%len(filler)];i+=1
        if cnt.get(f,0)<3:l.append(f);cnt[f]=cnt.get(f,0)+1
    return cnt
ids={c['id'] for c in cards}
decks=[dict(id='feiticeiro',name='Deck do Feiticeiro',desc='Controle: mágicas, armadilhas e magos. Depende de combinações.',cards=fit({'M006':3,'M008':3,'M005':3,'M007':2,'M026':1,'M033':1,'M025':1,'M016':2,'M017':2,'S001':3,'S002':3,'S003':3,'S004':2,'S005':2,'S008':2,'T001':2,'T006':2,'T007':1,'S019':1},['M002','M004','M012'])),
dict(id='dragao',name='Deck do Dragão',desc='Força: dragões, feras e equipamentos. Mãos ruins travam.',cards=fit({'M020':3,'M024':1,'M029':1,'M014':2,'M009':3,'M010':3,'M012':3,'M021':1,'M002':3,'M004':2,'M001':2,'S001':3,'S002':2,'S016':2,'S017':2,'S018':1,'S010':1,'T002':2,'T004':2,'T003':1},['M006','M011'])),
dict(id='guardiao',name='Deck do Guardião das Ruínas',desc='Versatilidade: golems, guerreiros e campos.',cards=fit({'M018':3,'M019':2,'M027':1,'M009':3,'M023':2,'M013':3,'M015':3,'M022':1,'M003':3,'M011':2,'S001':3,'S017':3,'S014':1,'S003':2,'S012':1,'S020':1,'FD04':1,'T005':1,'T009':2,'T010':2},['M001','M002']))]
for d in decks:
    assert sum(d['cards'].values())==40 and all(k in ids and v<=3 for k,v in d['cards'].items()),d['id']
json.dump(decks,open('data/decks.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(cards),'cartas e sprites ok')
