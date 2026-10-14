# Gera os sprites pixel-art do jogo (tiles, personagens e artes de cartas). Rode na raiz: python tools/make_sprites.py
from PIL import Image,ImageDraw,ImageFilter
import random,os,math
R=random.Random(7);os.makedirs('assets/art',exist_ok=True)
def ol(im,c=(30,20,12,255)):
    a=im.split()[3].filter(ImageFilter.MaxFilter(3));b=Image.new('RGBA',im.size,c);b.putalpha(a);b.alpha_composite(im);return b
def L(c,n):return tuple(max(0,min(255,x+n)) for x in c)
def noise(d,base,cols,p=.12):
    d.rectangle([0,0,15,15],fill=base)
    for x in range(16):
        for y in range(16):
            if R.random()<p:d.point((x,y),fill=R.choice(cols))
tiles=Image.new('RGBA',(192,16))
def tile(i,fn):
    im=Image.new('RGBA',(16,16));fn(ImageDraw.Draw(im));tiles.paste(im,(i*16,0))
def grass(d):noise(d,(91,154,60),[(76,133,50),(110,175,75),(70,125,48)],.2)
def flowers(d):grass(d);d.rectangle([9,4,10,5],fill=(246,215,67));d.rectangle([3,11,4,12],fill=(232,84,107));d.point((12,12),fill=(255,255,255))
def path(d):noise(d,(220,188,124),[(201,164,95),(233,205,150)],.18);d.line([(0,15),(15,15)],fill=(201,164,95))
def water(o):
    def f(d):
        d.rectangle([0,0,15,15],fill=(46,159,166))
        for x,y in [(2+o*3,4),(9-o*3,11)]:d.line([(x,y),(x+4,y)],fill=(111,209,207))
        d.line([(0,15),(15,15)],fill=(38,140,150))
    return f
def palm(d):
    grass(d);d.rectangle([7,6,8,15],fill=(122,82,48));d.line([(7,8),(7,12)],fill=(96,62,34))
    for b in [(1,3),(15,3),(3,0),(13,0),(8,0)]:d.line([(8,5),b],fill=(47,122,42),width=2)
    d.line([(8,5),(2,2)],fill=(74,162,60));d.line([(8,5),(14,2)],fill=(74,162,60))
def brick(d):
    d.rectangle([0,0,15,15],fill=(181,131,90))
    for y in (0,5,10,15):d.line([(0,y),(15,y)],fill=(150,100,65))
    for y,o in ((1,4),(6,0),(11,4)):
        for x in (o,o+8):d.line([(x,y),(x,y+3)],fill=(150,100,65))
def roof(d):
    d.rectangle([0,0,15,15],fill=(138,90,54))
    for y in (0,4,8,12):
        d.line([(0,y+3),(15,y+3)],fill=(100,62,36))
        for x in range(0,16,4):d.point((x+(2 if y%8 else 0),y+1),fill=(160,108,66))
def win(d):brick(d);d.rectangle([4,3,11,10],fill=(59,38,21));d.rectangle([5,4,10,9],fill=(143,211,239));d.line([(7,4),(7,9)],fill=(59,38,21));d.line([(5,7),(10,7)],fill=(59,38,21))
def door(d):brick(d);d.rectangle([4,2,11,15],fill=(74,47,27));d.rectangle([5,3,10,15],fill=(100,66,38));d.point((9,9),fill=(217,169,60))
def shore(d):d.rectangle([0,0,15,1],fill=(191,233,228,255))
def rock(d):grass(d);d.ellipse([3,6,13,14],fill=(130,130,138));d.ellipse([5,7,10,10],fill=(165,165,172))
for i,f in enumerate([grass,flowers,path,water(0),water(1),palm,brick,roof,win,door,shore,rock]):tile(i,f)
tiles.save('assets/tiles.png')
CH=['#c0392b','#2980b9','#27ae60','#8e44ad','#e8e0c0','#e67e22','#d35400','#2c3e50']
def char(sh,dr,fr):
    im=Image.new('RGBA',(16,24));d=ImageDraw.Draw(im);sk=(240,200,160);hr=(60,38,22);dk=(43,29,18);b=1 if fr else 0
    d.rectangle([4,19,6,22-(fr==1)],fill=dk);d.rectangle([9,19,11,22-(fr==2)],fill=dk)
    d.rectangle([3,11-b,12,19-b],fill=sh);d.rectangle([3,17-b,12,17-b],fill=(120,80,30));d.rectangle([2,12,2,17],fill=sh);d.rectangle([13,12,13,17],fill=sh)
    d.rectangle([4,3-b,11,11-b],fill=sk);d.rectangle([3,1-b,12,5-b],fill=hr)
    if dr==3:d.rectangle([3,1-b,12,9-b],fill=hr)
    else:
        for x in {0:(5,10),1:(4,),2:(11,)}[dr]:d.rectangle([x,7-b,x,8-b],fill=dk)
    return ol(im)
ch=Image.new('RGBA',(192,24*len(CH)))
for row,h in enumerate(CH):
    rgb=tuple(int(h[i:i+2],16) for i in (1,3,5))
    for dr in range(4):
        for fr in range(3):ch.paste(char(rgb,dr,fr),((dr*3+fr)*16,row*24))
ch.save('assets/chars.png')
def dragon(d,c):
    l=L(c,50);d.polygon([(2,14),(14,3),(16,16)],fill=l);d.polygon([(30,14),(18,3),(16,16)],fill=l)
    d.ellipse([9,13,23,27],fill=c);d.polygon([(21,16),(24,8),(29,9),(27,15)],fill=c);d.polygon([(10,24),(2,29),(9,27)],fill=c);d.point((27,10),fill=(255,240,60));d.rectangle([14,18,18,24],fill=L(c,70))
def mage(d,c):
    d.polygon([(16,12),(7,29),(25,29)],fill=c);d.polygon([(16,1),(10,11),(22,11)],fill=L(c,-30));d.ellipse([12,9,20,17],fill=(240,200,160));d.rectangle([12,12,20,13],fill=(60,38,22));d.line([(26,6),(26,29)],fill=(120,82,48),width=2);d.ellipse([24,3,28,7],fill=(255,230,90))
def knight(d,c):
    d.rectangle([10,12,22,26],fill=c);d.rectangle([11,3,21,13],fill=L(c,40));d.rectangle([13,7,19,8],fill=(20,20,30));d.rectangle([14,0,18,3],fill=(200,50,50));d.rectangle([4,13,9,24],fill=L(c,-25));d.rectangle([26,2,28,22],fill=(220,225,235));d.rectangle([24,21,30,23],fill=(150,110,40))
def skull(d,c):
    d.ellipse([6,3,26,21],fill=c);d.rectangle([11,18,21,27],fill=c);d.ellipse([9,10,14,16],fill=(30,20,30));d.ellipse([18,10,23,16],fill=(30,20,30));d.rectangle([15,17,17,19],fill=(30,20,30))
    for x in (12,15,18):d.line([(x,22),(x,27)],fill=(120,110,100))
def snake(d,c):
    for i in range(12):
        x=4+i*2;y=16+int(7*math.sin(i/1.6));d.ellipse([x-3,y-3,x+3,y+3],fill=c if i%2 else L(c,25))
    d.ellipse([24,8,30,14],fill=L(c,20));d.point((28,10),fill=(255,230,0));d.line([(30,11),(31,11)],fill=(220,40,40))
def scorp(d,c):
    d.ellipse([8,14,22,24],fill=c);d.ellipse([2,9,9,16],fill=L(c,30));d.ellipse([21,9,28,16],fill=L(c,30))
    for i,(x,y) in enumerate([(22,16),(26,12),(26,7),(22,4),(18,6)]):d.ellipse([x-2,y-2,x+2,y+2],fill=c)
    d.polygon([(16,5),(19,7),(17,9)],fill=(240,230,200))
def wolf(d,c):
    d.ellipse([4,14,24,27],fill=c);d.ellipse([19,7,30,18],fill=L(c,20));d.polygon([(20,8),(21,2),(24,8)],fill=c);d.polygon([(25,8),(27,2),(29,9)],fill=c);d.polygon([(5,16),(0,8),(7,13)],fill=c);d.point((26,12),fill=(255,230,60));d.rectangle([7,25,9,30],fill=c);d.rectangle([19,25,21,30],fill=c)
def bird(d,c):
    d.polygon([(2,10),(12,14),(10,24)],fill=L(c,-20));d.polygon([(30,10),(20,14),(22,24)],fill=L(c,-20));d.ellipse([10,10,22,26],fill=c);d.ellipse([12,4,20,12],fill=L(c,25));d.polygon([(16,8),(16,12),(16,15)],fill=(240,200,60));d.point((14,7),fill=(0,0,0))
def eye(d,c):
    d.ellipse([5,7,27,29],fill=c)
    for x in (6,10,22,25):d.polygon([(x,8),(x+2,2),(x+4,8)],fill=c)
    for x in (10,17):d.ellipse([x,14,x+5,20],fill=(255,255,255));d.ellipse([x+2,16,x+4,19],fill=(20,20,20))
def golem(d,c):
    d.rectangle([8,10,24,28],fill=c);d.rectangle([11,2,21,10],fill=L(c,25));d.rectangle([3,12,8,24],fill=L(c,-20));d.rectangle([24,12,29,24],fill=L(c,-20));d.rectangle([13,5,15,6],fill=(255,200,60));d.rectangle([17,5,19,6],fill=(255,200,60));d.line([(10,16),(22,16)],fill=L(c,-50))
def urn(d,c):
    d.polygon([(12,3),(20,3),(19,8),(26,14),(23,27),(9,27),(6,14),(13,8)],fill=c);d.rectangle([11,2,21,4],fill=L(c,35));d.line([(9,16),(23,16)],fill=(230,190,90));d.line([(9,21),(23,21)],fill=(230,190,90))
def star(d,c):
    p=[(16+(14 if i%2==0 else 6)*math.cos(i*math.pi/8-1.57),16+(14 if i%2==0 else 6)*math.sin(i*math.pi/8-1.57)) for i in range(16)];d.polygon(p,fill=c);d.ellipse([12,12,20,20],fill=(255,255,255))
def trapf(d,c):
    for i in range(8):
        a=i*math.pi/4;d.polygon([(16+9*math.cos(a-.35),16+9*math.sin(a-.35)),(16+15*math.cos(a),16+15*math.sin(a)),(16+9*math.cos(a+.35),16+9*math.sin(a+.35))],fill=L(c,40))
    d.ellipse([7,7,25,25],fill=c);d.ellipse([11,11,21,21],fill=(40,20,40))
def fusion(d,c):
    for r,k in ((15,0),(11,25),(7,50),(3,90)):d.ellipse([16-r,16-r,16+r,16+r],fill=L(c,k))
A={'dragon':(dragon,(190,60,50)),'mage':(mage,(110,70,170)),'knight':(knight,(110,130,160)),'skull':(skull,(235,230,215)),'snake':(snake,(70,150,70)),'scorpion':(scorp,(190,130,60)),'wolf':(wolf,(130,130,140)),'bird':(bird,(200,160,80)),'eye':(eye,(140,90,60)),'golem':(golem,(150,140,120)),'urn':(urn,(170,110,70)),'spell':(star,(60,200,160)),'trap':(trapf,(200,80,140)),'fusion':(fusion,(120,80,200))}
for n,(f,c) in A.items():
    im=Image.new('RGBA',(32,32));f(ImageDraw.Draw(im),c);ol(im).save(f'assets/art/{n}.png')
print('sprites ok')
