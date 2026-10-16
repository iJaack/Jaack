"""Render either language from the same structured guide schema."""
from pathlib import Path
import html,json
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
FONT=Path('/System/Library/Fonts/Supplemental')
for name,file in [('Arial','Arial.ttf'),('Arial-Bold','Arial Bold.ttf'),('Arial-Italic','Arial Italic.ttf')]:pdfmetrics.registerFont(TTFont(name,str(FONT/file)))
pdfmetrics.registerFontFamily('Arial',normal='Arial',bold='Arial-Bold',italic='Arial-Italic',boldItalic='Arial-Bold')
W,H=390,700; M=24; CW=W-2*M
GREEN=HexColor('#184936'); INK=HexColor('#18241E'); MUTED=HexColor('#52675B'); PAPER=HexColor('#F8F7F1'); LIGHT=HexColor('#E7EEE5'); ORANGE=HexColor('#A65827')
BASE=ParagraphStyle('body',fontName='Arial',fontSize=14.5,leading=19.4,textColor=INK,spaceAfter=0)

def clean(s):return s.replace('—','-').replace('–','-').replace('\u2011','-')

def render_pdf(pages, output, lang='it'):
    OUT=Path(output)
    OUT.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(OUT),pagesize=(W,H),pageCompression=1)
    c.setTitle('Mono Green Landfall - '+('guida IT' if lang=='it' else 'English guide'));c.setAuthor('Moxie');c.setSubject('60+15 / landfall / sideboard / opening hands')
    layout=[]
    def para(text,y,size=14.2 if lang=='en' else 14.5,leading=19.0 if lang=='en' else 19.4,color=INK,x=M,width=CW,bold=False):
     style=ParagraphStyle('p',parent=BASE,fontSize=size,leading=leading,textColor=color,fontName='Arial-Bold' if bold else 'Arial')
     q=Paragraph(clean(text),style);_,hh=q.wrap(width,H);q.drawOn(c,x,y-hh);return y-hh
    for i,page in enumerate(pages):
     c.setFillColor(PAPER);c.rect(0,0,W,H,stroke=0,fill=1)
     c.setFillColor(GREEN);c.rect(0,H-8,W,8,stroke=0,fill=1)
     c.bookmarkPage(page['key']);c.addOutlineEntry(page['title'].replace('\n',' '),page['key'],level=0)
     y=H-33;y=para(page['kicker'],y,size=9.4,leading=12,color=MUTED,bold=True)
     y-=12
     y=para(page['title'].replace('\n','<br/>'),y,size=28,leading=30.5,color=GREEN,bold=True);y-=18
     for kind,data in page['blocks']:
      if kind=='body':y=para(data,y);y-=7 if lang=='en' else 10
      elif kind=='handcards':y=para(data,y,size=12.4,leading=16.3,color=GREEN);y-=7
      elif kind=='handbody':y=para(data,y,size=13.4,leading=17.5);y-=8
      elif kind=='small':y=para(data,y,size=12.1,leading=16,color=MUTED);y-=9
      elif kind=='plan':y=para(data,y,size=13.2,leading=17.2);y-=5
      elif kind=='heading':
       y-=4;y=para(data,y,size=11,leading=14,color=GREEN,bold=True);y-=7
      elif kind=='box':
       style=ParagraphStyle('box',parent=BASE,fontSize=13.7,leading=18.3)
       q=Paragraph(data,style);_,hh=q.wrap(CW-24,H)
       c.setFillColor(LIGHT);c.roundRect(M,y-hh-22,CW,hh+22,8,stroke=0,fill=1)
       q.drawOn(c,M+12,y-hh-11);y-=hh+(28 if lang=='en' else 34)
      elif kind=='row':
       q,n,u=data
       c.setFillColor(GREEN);c.roundRect(M,y-21,27,21,5,stroke=0,fill=1)
       c.setFillColor(PAPER);c.setFont('Arial-Bold',13);c.drawCentredString(M+13.5,y-15,str(q))
       end=para(html.escape(n),y-2,size=13.6,leading=18,x=M+37,width=CW-37)
       hh=max(24,y-end+3);c.linkURL(u,(M,y-hh,W-M,y),relative=0,thickness=0);y-=hh+2
      elif kind=='ref':
       label,u=data;start=y;y=para('<u>'+html.escape(label)+'</u>',y,size=10.6,leading=13.8,color=GREEN);c.linkURL(u,(M,y,W-M,start),relative=0,thickness=0);y-=5
      elif kind=='nav':
       # Two columns of large tap areas keep the whole guide one touch away.
       nw=(CW-10)/2;start=y;rh=37
       for j,(dest,label) in enumerate(data):
        col=j%2;row=j//2;x=M+col*(nw+10);yy=start-row*rh
        c.setFillColor(LIGHT);c.roundRect(x,yy-33,nw,31,5,stroke=0,fill=1)
        para(label,yy-6,size=10.2,leading=12.2,color=GREEN,x=x+8,width=nw-16,bold=True)
        c.linkRect('',dest,(x,yy-33,x+nw,yy-2),relative=0,thickness=0)
       y=start-((len(data)+1)//2)*rh-4
     if y<49:raise RuntimeError(f'Page {i+1} {page["key"]} overflows: bottom={y}')
     layout.append({'page':i+1,'key':page['key'],'content_bottom':round(y,1)})
     c.setStrokeColor(HexColor('#D1DCCD'));c.line(M,38,W-M,38)
     c.setFillColor(MUTED);c.setFont('Arial',10);c.drawString(M,22,'INDICE' if lang=='it' else 'CONTENTS');c.linkRect('','index',(M,14,M+55,33),relative=0,thickness=0)
     c.drawCentredString(W/2,22,f'{i+1:02d} / {len(pages):02d}')
     if i<len(pages)-1:c.drawRightString(W-M,22,'AVANTI >' if lang=='it' else 'NEXT >');c.linkRect('',pages[i+1]['key'],(W-95,14,W-M,33),relative=0,thickness=0)
     c.showPage()
    c.save()
    return layout
