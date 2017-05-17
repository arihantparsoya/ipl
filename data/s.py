import csv

f = open('winners.csv', 'rt')
reader = csv.reader(f)
full_data = []

current_year = 2011
for i in reader:
    full_data.append(i)

year_data = []
teams = []

for i in full_data:
    if int(i[1]) == current_year:
        year_data.append(i)
        teams.append(i[2])


teams = list(set(teams))
r = {}

for t in teams:
    points = 0
    r[t] = []
    for d in year_data:
        if d[2] == t or d[3] == t:
            if d[4] == t:
                points = points + 2
                r[t].append({t: points, t+"_comments": d[2] + ' Vs ' + d[3] + '<br>' + t + ' Won'})
            elif d[4] == "":
                points = points + 1
                r[t].append({t: points, t+"_comments": d[2] + ' Vs ' + d[3] + '<br>' + ' Draw '})
            else:
                r[t].append({t: points, t+"_comments": d[2] + ' Vs ' + d[3] + '<br>' + t + ' Lost' })


#print(r)
print(teams)
res = []
dummy = {}

for t in teams:
    dummy[t] = 0#{**dummy, **{t: 0}}
    dummy[t+"_comments"] = ""
    dummy['match'] = 0

res.append(dummy)
k = dummy
for i in range(0, 2*(len(teams)-1)):
    dummy = {}
    for t in teams:
        try:
            dummy = {**dummy, **r[t][i]}
        except:
            try:
                dummy = {**dummy, **r[t][i-1]}
            except:
                dummy = k
    dummy['match'] = i + 1
    k = dummy
    res.append(dummy)

t = res
keys = t[0].keys()

with open(str(current_year) + '.csv', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(t)
