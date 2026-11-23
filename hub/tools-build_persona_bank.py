import re, sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import FormulaRule, ColorScaleRule
TINT = {"Who":"EDEAE0","Trigger moments":"F6F3EA","Goals":"EEF2F4","Pains (external)":"F8EEEA","Fears (internal)":"F3ECF2","Beliefs and myths":"FBF4E4","Questions they ask":"EAF1EC","Objections to hiring":"F1EEE8","Their words":"EEF0F7","Success picture":"EAF3EF","Ready angles":"F4F1E6"}

src, out = sys.argv[1], sys.argv[2]
text = open(src).read()

SECTIONS = ["Who","Trigger moments","Goals","Pains (external)","Fears (internal)","Beliefs and myths",
            "Questions they ask","Objections to hiring","Their words","Success picture","Ready angles"]
SOURCES = ["Client call","DM","Comment","Proposal","Observation","Other","Draft (Claude)"]
PILLARS = ["The Work","The Change","The Lesson","Working with me","My Story","My Thinking (Arabic)"]
GOALS = ["Educate","Prove","Connect","Sell","Spark"]
STATUS = ["New","Idea","Drafted","Posted"]
BUILDS = ["Relevance","Authority","Trust","Likability","Action"]
BCOL = {"Relevance":("B5530C","FFEBD9"),"Authority":("1E5BB8","E3EDFB"),"Trust":("1E7B34","E3F5E7"),"Likability":("A3195B","FBE4EF"),"Action":("2C2C2C","EDEDED")}

personas = [("Founders","PERSONA 1. FOUNDERS"),("Executives and teams","PERSONA 2. EXECUTIVES AND TEAMS"),
            ("Speakers","PERSONA 3. SPEAKERS"),("Creative directors","PERSONA 4. CREATIVE DIRECTORS")]

def block(header):
    i = text.index("## "+header)
    j = text.find("\n## ", i+5)
    return text[i:j if j>0 else None]

def split_answer(line):
    for key in ["Truth:","Direction:","Answer:"]:
        if key in line:
            a,b = line.split(key,1); return a.strip(), b.strip()
    return line.strip(), ""

def rows_for(b):
    rows=[]
    m = re.search(r"\nWho: (.+)", b); 
    if m: rows.append(("Who", m.group(1).strip(), ""))
    for sec in re.split(r"\n### ", b)[1:]:
        title, *body = sec.split("\n")
        title = title.strip()
        if title.startswith("Questions"): title="Questions they ask"
        if title.startswith("Beliefs"): title="Beliefs and myths"
        if title.startswith("Objections"): title="Objections to hiring"
        if title.startswith("Their words"): title="Their words"
        body = [l for l in body if l.strip()]
        items = [l[2:].strip() for l in body if l.startswith("- ")]
        if not items and body: items=[" ".join(l.strip() for l in body)]
        for it in items:
            line, ans = split_answer(it)
            rows.append((title, line, ans))
    return rows

HDR = ["Section","Line (in their words)","Truth / answer direction","Source","Date added","Pillar","Goal","Builds","Status","Used in post (date / link)","Notes","Buyer (0-2)","Proof (0-2)","Sales use (0-2)","Effort (2 = under 1 h)","Score","Funnel layer"]
WID = [22,60,50,18,13,20,12,13,11,26,30,9,9,9,10,8,11]
dark = PatternFill("solid", fgColor="1A1B1D"); cream = Font(color="E8E2D0", bold=True, name="Calibri", size=11)
thin = Side(style="thin", color="D9D6CC"); border = Border(bottom=thin)
wrap = Alignment(wrap_text=True, vertical="top")

wb = Workbook()
ws0 = wb.active; ws0.title = "How to use"
guide = [
 ["Persona bank: add new lines every week"],
 [""],
 ["1. One sheet per persona. Add a row at the bottom of the right sheet."],
 ["2. Pick the Section from the dropdown. Write the line in the client's own words."],
 ["3. Myths, questions and objections: add the truth or your answer in column C."],
 ["4. Source: where you heard it. Date added: the day you heard it."],
 ["5. When it becomes a post: set Pillar, Goal, Builds and Status, and add the post date or link."],
 ["   Builds = what the reader concludes about you: Relevance (he gets my problem), Authority (he knows how), Trust (he is safe to hire), Likability (I like how he thinks), Action (I know the next step)."],
 ["   One main Builds per post. Check the Builds balance tab every Thursday; plan the weakest one first on Sunday."],
 ["   Score = Buyer + Proof + Sales use + Effort (0 to 2 each, max 8). Sort by Score to pick the next post. Funnel layer fills itself from Builds."],
 ["   Everything after Status fills itself: type Section, Line, Source and Status; Pillar, Goal, Builds, the 4 scores, Score and Funnel layer calculate from the 'Score rules' tab."],
 ["6. Every Sunday: add at least 3 new lines from the week's calls, DMs, comments and Upwork messages."],
 ["7. Reuse a posted line after 3 months with a new angle."],
 [""],
 ["Rows marked 'Draft (Claude)' are educated guesses. Replace them with real client words over time."],
 ["Use the filter arrows on each sheet to see one section, or only lines not yet posted."],
 ["Goal picks the format: Educate = carousel, Prove = text + real slides, Connect = text or personal photo, Sell = text + branded image or video, Spark = text only."],
]
for r in guide: ws0.append(r)
ws0["A1"].font = Font(bold=True, size=18, color="E8E2D0"); ws0["A1"].fill = dark; ws0.row_dimensions[1].height = 40
ws0.sheet_properties.tabColor = "FEA307"; ws0.column_dimensions["A"].width = 120
for row in ws0.iter_rows(min_row=2):
    for c in row: c.alignment = Alignment(wrap_text=True)

SUG = {"Who":("The Lesson","Educate","Relevance",0,1,1),
 "Trigger moments":("The Lesson","Educate","Relevance",1,1,2),
 "Goals":("The Work","Prove","Authority",1,1,1),
 "Pains (external)":("The Lesson","Educate","Relevance",1,1,2),
 "Fears (internal)":("The Lesson","Educate","Relevance",1,1,2),
 "Beliefs and myths":("The Lesson","Educate","Authority",1,1,2),
 "Questions they ask":("The Lesson","Educate","Authority",1,2,2),
 "Objections to hiring":("Working with me","Sell","Trust",1,2,2),
 "Their words":("The Lesson","Spark","Relevance",1,1,2),
 "Success picture":("The Work","Prove","Authority",1,2,1),
 "Ready angles":("The Change","Educate","Authority",1,2,1)}
BUY = {"Founders":2,"Executives and teams":2,"Speakers":1,"Creative directors":1}
def make_sheet(name, rows):
    ws = wb.create_sheet(name[:31])
    ws.append(HDR)
    for c in ws[1]:
        c.fill = dark; c.font = cream; c.alignment = Alignment(vertical="center", wrap_text=True)
    ws.row_dimensions[1].height = 30
    for sec,line,ans in rows:
        ws.append([sec,line,ans,"Draft (Claude)","2026-11-23","","","","New","",""])
        r = ws.max_row
        for c in ws[r][:17]:
            c.fill = PatternFill("solid", fgColor=TINT.get(sec,"FFFFFF"))
        ws[f"A{r}"].font = Font(bold=True, color="1A1B1D")
        ws[f"B{r}"].font = Font(color="1A1B1D", size=11)
        ws[f"C{r}"].font = Font(color="404B50", italic=True)
        ws[f"D{r}"].font = Font(color="6B6A66", italic=True, size=10)
    last = max(ws.max_row, 2) + 200
    for i,w in enumerate(WID): ws.column_dimensions[chr(65+i)].width = w
    for r in range(2,last+1):
        R="'Score rules'!"
        ws[f"F{r}"] = f'=IF(A{r}="","",IFERROR(VLOOKUP(A{r},{R}$A$4:$F$14,2,FALSE),""))'
        ws[f"G{r}"] = f'=IF(A{r}="","",IFERROR(VLOOKUP(A{r},{R}$A$4:$F$14,3,FALSE),""))'
        ws[f"H{r}"] = f'=IF(A{r}="","",IFERROR(VLOOKUP(A{r},{R}$A$4:$F$14,4,FALSE),""))'
        ws[f"L{r}"] = f'=IF(B{r}="","",IFERROR(VLOOKUP("{name}",{R}$H$4:$I$9,2,FALSE),1))'
        ws[f"M{r}"] = f'=IF(B{r}="","",IFERROR(VLOOKUP(D{r},{R}$K$4:$L$11,2,FALSE),1))'
        ws[f"N{r}"] = f'=IF(B{r}="","",IFERROR(VLOOKUP(A{r},{R}$A$4:$F$14,5,FALSE),1))'
        ws[f"O{r}"] = f'=IF(B{r}="","",IFERROR(VLOOKUP(F{r},{R}$N$4:$O$9,2,FALSE),1))'
        for col in "FGHLMNO": ws[f"{col}{r}"].font = Font(color="1A1B1D")
        ws[f"P{r}"] = f'=IF(B{r}="","",IF(I{r}="Posted","Used",SUM(L{r}:O{r})))'
        ws[f"Q{r}"] = f'=IF(H{r}="","",IF(OR(H{r}="Relevance",H{r}="Likability"),"TOFU",IF(H{r}="Authority","MOFU","BOFU")))'
        ws[f"P{r}"].fill = PatternFill("solid", fgColor="F2F2F2"); ws[f"Q{r}"].fill = PatternFill("solid", fgColor="F2F2F2")
    ws.conditional_formatting.add(f"P2:P{last}", ColorScaleRule(start_type="num",start_value=0,start_color="FFFFFF",end_type="num",end_value=8,end_color="57BB8A"))
    for lay,(fg,bg) in {"TOFU":("B5530C","FFEBD9"),"MOFU":("1E5BB8","E3EDFB"),"BOFU":("1E7B34","E3F5E7")}.items():
        ws.conditional_formatting.add(f"Q2:Q{last}", FormulaRule(formula=[f'$Q2="{lay}"'], fill=PatternFill("solid", fgColor=bg), font=Font(bold=True, color=fg)))
    dvs = DataValidation(type="list", formula1='"0,1,2"', allow_blank=True); dvs.showErrorMessage=False
    ws.add_data_validation(dvs); dvs.add(f"L2:O{last}")
    for row in ws.iter_rows(min_row=2, max_row=last, max_col=len(HDR)):
        for c in row: c.alignment = wrap; c.border = border
    ws.freeze_panes = "C2"
    ws.row_dimensions[1].height = 36
    for c in ws[1]: c.font = Font(color="E8E2D0", bold=True, size=12)
    for col in "DEFGHILMNOPQ":
        for r in range(2,last+1): ws[f"{col}{r}"].alignment = Alignment(horizontal="center", vertical="top", wrap_text=True)
    green = PatternFill("solid", fgColor="CDEBD3"); amber = PatternFill("solid", fgColor="FBE3B5"); blue = PatternFill("solid", fgColor="D6E4F5")
    ws.conditional_formatting.add(f"I2:I{last}", FormulaRule(formula=[f'$I2="Posted"'], fill=green, font=Font(bold=True, color="1E5B2E")))
    ws.conditional_formatting.add(f"I2:I{last}", FormulaRule(formula=[f'$I2="Drafted"'], fill=amber, font=Font(bold=True, color="7A4C00")))
    ws.conditional_formatting.add(f"I2:I{last}", FormulaRule(formula=[f'$I2="Idea"'], fill=blue, font=Font(bold=True, color="1F3E66")))
    ws.sheet_properties.tabColor = "1A1B1D"
    ws.auto_filter.ref = f"A1:Q{last}"
    for b,(fg,bg) in BCOL.items():
        ws.conditional_formatting.add(f"H2:H{last}", FormulaRule(formula=[f'$H2="{b}"'], fill=PatternFill("solid", fgColor=bg), font=Font(bold=True, color=fg)))
    for col, opts in [("A",SECTIONS),("D",SOURCES),("F",PILLARS),("G",GOALS),("H",BUILDS),("I",STATUS)]:
        dv = DataValidation(type="list", formula1='"'+",".join(opts)+'"', allow_blank=True)
        dv.error = "Pick from the list"; dv.showErrorMessage = False
        ws.add_data_validation(dv); dv.add(f"{col}2:{col}{last}")
    dvd = DataValidation(type="date", allow_blank=True); ws.add_data_validation(dvd); dvd.add(f"E2:E{last}")
    for r in range(2,last+1): ws[f"E{r}"].number_format = "yyyy-mm-dd"
    return len(rows)

# Score rules sheet
sr = wb.create_sheet("Score rules", 1); sr.sheet_properties.tabColor = "57BB8A"
sr["A1"] = "Score rules: the sheet fills Pillar, Goal, Builds and the score from these tables. Change a value here and every row updates."
sr["A1"].font = Font(bold=True, size=13, color="1A1B1D"); sr.merge_cells("A1:O1")
sr["A2"] = "You only type: Section, Line, Source, Status. Overwrite Pillar, Goal or Builds in a row if you want a different choice."
sr["A2"].font = Font(italic=True, color="404B50"); sr.merge_cells("A2:O2")
heads = [("A3","Section"),("B3","Pillar"),("C3","Goal"),("D3","Builds"),("E3","Sales use (0-2)"),("F3","Note"),
         ("H3","Sheet"),("I3","Buyer (0-2)"),("K3","Source"),("L3","Proof (0-2)"),("N3","Pillar"),("O3","Effort (2 = under 1 h)")]
for ref,t in heads:
    sr[ref] = t; sr[ref].fill = dark; sr[ref].font = Font(color="E8E2D0", bold=True)
sec_rules = [("Who","The Lesson","Educate","Relevance",0,"Background, rarely a post"),
 ("Trigger moments","The Lesson","Educate","Relevance",1,""),
 ("Goals","The Work","Prove","Authority",1,""),
 ("Pains (external)","The Lesson","Educate","Relevance",1,""),
 ("Fears (internal)","The Lesson","Educate","Relevance",1,""),
 ("Beliefs and myths","The Lesson","Educate","Authority",1,""),
 ("Questions they ask","The Lesson","Educate","Authority",2,"People ask it before buying"),
 ("Objections to hiring","Working with me","Sell","Trust",2,"Answers a reason not to hire"),
 ("Their words","The Lesson","Spark","Relevance",1,""),
 ("Success picture","The Work","Prove","Authority",2,""),
 ("Ready angles","The Change","Educate","Authority",2,"")]
for i,row in enumerate(sec_rules, start=4):
    for j,v in enumerate(row): sr.cell(i, 1+j, v)
buyer = [("Founders",2),("Executives and teams",2),("Speakers",1),("Creative directors",1),("New persona",1)]
for i,(a,b) in enumerate(buyer, start=4): sr.cell(i,8,a); sr.cell(i,9,b)
proof = [("Client call",2),("DM",2),("Upwork message",2),("Proposal",2),("Comment",1),("Observation",1),("Other",1),("Draft (Claude)",0)]
for i,(a,b) in enumerate(proof, start=4): sr.cell(i,11,a); sr.cell(i,12,b)
effort = [("The Lesson",2),("Working with me",2),("My Story",2),("My Thinking (Arabic)",2),("The Work",1),("The Change",0)]
for i,(a,b) in enumerate(effort, start=4): sr.cell(i,14,a); sr.cell(i,15,b)
for col,w in zip("ABCDEFGHIJKLMNO",[22,18,10,12,12,30,2,22,10,2,18,10,2,22,16]): sr.column_dimensions[col].width = w
for r in range(4,15):
    for c in (5,9,12,15):
        sr.cell(r,c).fill = PatternFill("solid", fgColor="E3F5E7"); sr.cell(r,c).font = Font(bold=True, color="1E7B34")
sr["A16"] = "Proof: real client words (call, DM, proposal) score 2; a comment or observation 1; a Claude draft 0. Replace drafts with real words and they rise."
sr["A17"] = "Effort: text posts are quick (2); a case study takes longer (1); a carousel takes about 90 minutes (0)."
sr["A18"] = "Score = Buyer + Proof + Sales use + Effort, max 8. A posted line shows 'Used'. Sort by Score to pick the next post."
for ref in ("A16","A17","A18"): sr[ref].font = Font(italic=True, color="404B50")

counts={}
for name, hdr in personas:
    counts[name]=make_sheet(name, rows_for(block(hdr)))
counts["New persona"]=make_sheet("New persona", [])
wsb = wb.create_sheet("Builds balance", 1)
names = [n for n,_ in personas]+["New persona"]
wsb.append(["Builds","The reader thinks","Monthly target (of 20)","Posted (all time)","Ideas and drafts waiting","Gap note"])
for c in wsb[1]: c.fill=dark; c.font=Font(color="E8E2D0", bold=True, size=12); c.alignment=Alignment(wrap_text=True, vertical="center")
thinks={"Relevance":"He gets my problem.","Authority":"He knows how to fix it.","Trust":"He is safe to hire.","Likability":"I like how he thinks.","Action":"I know the next step."}
target={"Relevance":5,"Authority":6,"Trust":5,"Likability":3,"Action":2}
for i,b in enumerate(BUILDS, start=2):
    posted="+".join(f"COUNTIFS('{n}'!H:H,\"{b}\",'{n}'!I:I,\"Posted\")" for n in names)
    wait="+".join(f"COUNTIFS('{n}'!H:H,\"{b}\",'{n}'!I:I,\"Idea\")+COUNTIFS('{n}'!H:H,\"{b}\",'{n}'!I:I,\"Drafted\")" for n in names)
    wsb.append([b,thinks[b],target[b],"="+posted,"="+wait,f'=IF(E{i}=0,"No ideas yet: mine the bank for this one","OK")'])
    fg,bg=BCOL[b]
    for c in wsb[i]: c.fill=PatternFill("solid", fgColor=bg); c.alignment=Alignment(wrap_text=True, vertical="center")
    wsb[f"A{i}"].font=Font(bold=True, color=fg, size=12)
    wsb.row_dimensions[i].height=28
wsb.append([]); wsb.append(["Thursday review: which Builds is weakest this month? Plan it as Sunday card 1. Founders hire only when all five are filled; Trust is usually the gap."])
wsb["A8"].font=Font(italic=True, color="404B50")
for col,w in zip("ABCDEF",[16,30,20,18,24,40]): wsb.column_dimensions[col].width=w
wsb.sheet_properties.tabColor="1E7B34"; wsb.freeze_panes="A2"
wb.save(out)
print(counts)
