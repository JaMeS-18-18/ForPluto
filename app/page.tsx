"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Send, Trash2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GroupCard } from "@/components/GroupCard"

interface Student {
  id: string
  name: string
  doska: boolean
  essential: boolean
  speaking: boolean
  listening: boolean
  mindset: boolean
  murphy: boolean
  additionalTask: string[]
  destination: string
  done: boolean
  [key: string]: any; // allow dynamic fields
}


interface Group {
  id: number;
  groupName: string;
  students: Student[];
  fields: string[];
  labels: { [key: string]: string };
}

function createEmptyStudent(): Student {
  return {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    name: "",
    doska: false,
    essential: false,
    speaking: false,
    listening: false,
    mindset: false,
    murphy: false,
    additionalTask: [],
    destination: "",
    done: false,
  };
}


export default function StudentManagement() {
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);

  const defaultLabels = {
    name: "Name",
    doska: "Doska",
    essential: "Essential",
    speaking: "Speaking",
    listening: "Listening",
    mindset: "Mindset",
    murphy: "Murphy",
    additionalTask: "Additional task (essay, analysis)",
    destination: "Destination",
    done: "Done",
    actions: "Actions",
  }
  const defaultFields = [
    "name",
    "doska",
    "essential",
    "speaking",
    "listening",
    "mindset",
    "murphy",
    "additionalTask",
    "destination",
    "done",
  ]
  const [fields, setFields] = useState<string[]>(defaultFields)
  // Add column
  const addColumn = (groupId: number) => {
    const newField = prompt("Yangi ustun nomi (faqat lotin harflari, masalan: homework)")?.trim();
    if (!newField) return;
    setGroups((prev) => prev.map((group) => {
      if (group.id !== groupId) return group;
      if (group.fields.includes(newField) || newField === "name" || newField === "actions") return group;
      const updatedFields = [...group.fields, newField];
      const updatedLabels = { ...group.labels, [newField]: newField };
      return {
        ...group,
        fields: updatedFields,
        labels: updatedLabels,
        students: group.students.map((s) => ({ ...s, [newField]: newField === "additionalTask" ? [] : "" }))
      };
    }));
    toast({ title: "Ustun qo'shildi", description: `${newField} ustuni qo'shildi` });
  }

  // Remove column
  const removeColumn = (groupId: number, field: string) => {
    if (field === "name" || field === "actions") return;
    setGroups((prev) => prev.map((group) => {
      if (group.id !== groupId) return group;
      const updatedFields = group.fields.filter((f) => f !== field);
      const updatedLabels = { ...group.labels };
      delete updatedLabels[field];
      return {
        ...group,
        fields: updatedFields,
        labels: updatedLabels,
        students: group.students.map((s) => {
          const copy = { ...s };
          delete copy[field];
          return copy;
        })
      };
    }));
    toast({ title: "Ustun o'chirildi", description: `${field} ustuni o'chirildi` });
  }
  const [labels, setLabels] = useState(defaultLabels)


  const [newGroupName, setNewGroupName] = useState("");
  const [newStudentName, setNewStudentName] = useState("");


  // localStorage dan ma'lumotlarni yuklash (faqat client-side)
  useEffect(() => {
    const savedGroups = localStorage.getItem("groups");
    if (savedGroups) {
      try {
        const parsed = JSON.parse(savedGroups);
        const groupsWithDefaults = parsed.map((group: any) => ({
          ...group,
          fields: group.fields ?? [...defaultFields],
          labels: group.labels ?? { ...defaultLabels },
        }));
        setGroups(groupsWithDefaults);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Guruhlar o'zgarishini localStorage ga saqlash
  useEffect(() => {
    if (typeof window !== "undefined" && groups.length >= 0) {
      localStorage.setItem("groups", JSON.stringify(groups));
    }
  }, [groups]);


  // Guruh qo'shish
  const addGroup = () => {
    if (newGroupName.trim()) {
      const newGroup: Group = {
        id: Date.now(),
        groupName: newGroupName.trim(),
        students: [],
        fields: [...defaultFields],
        labels: { ...defaultLabels },
      };
      setGroups((prev) => [newGroup, ...prev]);
      setNewGroupName("");
      toast({ title: "Guruh qo'shildi", description: `${newGroupName} guruh qo'shildi` });
    }
  };

  // O'quvchi qo'shish (faqat tanlangan guruhda)
  const addStudent = () => {
    if (newStudentName.trim() && selectedGroup !== null) {
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedGroup
            ? { ...g, students: [{ ...createEmptyStudent(), name: newStudentName.trim() }, ...g.students] }
            : g
        )
      );
      setNewStudentName("");
      toast({ title: "O'quvchi qo'shildi", description: `${newStudentName} ro'yxatga qo'shildi` });
    }
  };


  const addStudentBelow = (index: number) => {
    if (selectedGroup === null) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup
          ? {
              ...g,
              students: (() => {
                const arr = [...g.students];
                arr.splice(index + 1, 0, createEmptyStudent());
                return arr;
              })(),
            }
          : g
      )
    );
    toast({ title: "Qator qo'shildi", description: "Yangi o'quvchi qatori qo'shildi" });
  };


  const addNote = (id: string) => {
    if (selectedGroup === null) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === id ? { ...s, additionalTask: [...s.additionalTask, ""] } : s
              ),
            }
          : g
      )
    );
  };


  const updateNote = (id: string, index: number, value: string) => {
    if (selectedGroup === null) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === id
                  ? {
                      ...s,
                      additionalTask: s.additionalTask.map((t, i) => (i === index ? value : t)),
                    }
                  : s
              ),
            }
          : g
      )
    );
  };


  const removeNote = (id: string, index: number) => {
    if (selectedGroup === null) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup
          ? {
              ...g,
              students: g.students.map((s) =>
                s.id === id
                  ? {
                      ...s,
                      additionalTask: s.additionalTask.filter((_, i) => i !== index),
                    }
                  : s
              ),
            }
          : g
      )
    );
  };

  const updateLabel = (groupId: number, key: string, value: string) => {
    setGroups((prev) => prev.map((group) => {
      if (group.id !== groupId) return group;
      const updatedLabels = { ...group.labels, [key]: value };
      return { ...group, labels: updatedLabels };
    }));
  }


  const removeStudent = (id: string) => {
    if (selectedGroup === null) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup
          ? { ...g, students: g.students.filter((student) => student.id !== id) }
          : g
      )
    );
    toast({ title: "O'quvchi o'chirildi", description: "O'quvchi ro'yxatdan o'chirildi" });
  };


  const updateStudent = (id: string, field: keyof Student, value: any) => {
    if (selectedGroup === null) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup
          ? {
              ...g,
              students: g.students.map((student) =>
                student.id === id ? { ...student, [field]: value } : student
              ),
            }
          : g
      )
    );
  };


  const toggleField = (id: string, field: keyof Student) => {
    if (selectedGroup === null) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroup
          ? {
              ...g,
              students: g.students.map((student) =>
                student.id === id ? { ...student, [field]: !student[field] } : student
              ),
            }
          : g
      )
    );
  };

  // Faqat tanlangan guruh uchun Telegramga yuborish
  const sendToTelegram = () => {
    if (selectedGroup === null) return;
    const group = groups.find((g) => g.id === selectedGroup);
    if (!group) return;
    try {
      const message = formatDataForTelegram(group);
      const encodedMessage = encodeURIComponent(message);
      const telegramUrl = `https://t.me/Pluto_18?text=${encodedMessage}`;
      window.open(telegramUrl, "_blank");
      toast({
        title: "Telegram ochildi",
        description: "Xabar tayyor, faqat 'Send' tugmasini bosing",
      });
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Telegram ochishda xatolik yuz berdi",
        variant: "destructive",
      });
    }
  };


  // Faqat tanlangan guruh o'quvchilari uchun hisobot
  const formatDataForTelegram = (group: Group) => {
    let message = "📚  O'quvchilar hisoboti\n\n";
    group.students.forEach((student, index) => {
      message += `${index + 1}. ${student.name}\n`;
      group.fields.forEach((field) => {
        if (field === "name") return;
        if (field === "additionalTask" && Array.isArray(student.additionalTask) && student.additionalTask.length) {
          message += `${group.labels[field] || field}:\n`;
          student.additionalTask.forEach((n, i) => {
            message += `  ${i + 1}. ${n}\n`;
          });
        } else if (typeof student[field] === "boolean") {
          message += `${group.labels[field] || field}: ${student[field] ? "✅" : "❌"}\n`;
        } else if (student[field]) {
          message += `${group.labels[field] || field}: ${student[field]}\n`;
        }
      });
      message += "\n";
    });
    return message;
  };


  const removeGroup = (groupId: number) => {
    setGroups((prev) => prev.filter((group) => group.id !== groupId));
    toast({ title: "Guruh o'chirildi", description: "Guruh ro'yxatdan o'chirildi" });
    if (selectedGroup === groupId) setSelectedGroup(null);
  };

  return (
    <div className="container p-5">
      {!selectedGroup ? (
        <>
          <h1 className="text-2xl font-bold mb-6">Guruhlar</h1>
          <div className="mb-8 flex gap-2">
            <Input
              placeholder="Yangi guruh nomi"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addGroup()}
              className="flex-1"
            />
            <Button onClick={addGroup} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Guruh qo'shish
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {groups.length === 0 ? (
              <div className="text-center py-12 text-gray-500 col-span-3">
                <p className="text-lg mb-2">Hozircha guruhlar yo'q</p>
                <p className="text-sm">Yuqoridagi maydondan yangi guruh qo'shing</p>
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="relative">
                  <div onClick={() => setSelectedGroup(group.id)} className="cursor-pointer">
                    <GroupCard groupName={group.groupName} reports={[]} />
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeGroup(group.id)}
                    className="absolute top-2 right-2 z-10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <Button className="mb-4" onClick={() => setSelectedGroup(null)}>Orqaga</Button>
          <h2 className="text-xl font-bold mb-4">
            {groups.find((g) => g.id === selectedGroup)?.groupName} o‘quvchilari boshqaruvi
          </h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center"> O'quvchilar boshqaruvi</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add new student */}
              <div className="mb-6 flex gap-2">
                <Input
                  placeholder="Yangi o'quvchi ismi"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addStudent()}
                  className="flex-1"
                />
                <Button onClick={addStudent} className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Qo'shish
                </Button>
              </div>
              {(() => {
                const group = groups.find((g) => g.id === selectedGroup);
                if (!group || group.students.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg mb-2">Hozircha o'quvchilar yo'q</p>
                      <p className="text-sm">Yuqoridagi maydondan yangi o'quvchi qo'shing</p>
                    </div>
                  );
                }
                return (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-50">
                            {group.fields.map((field) => (
                              <th key={field} className={`border border-gray-300 p-3 text-center font-semibold relative group`}>
                                <Input
                                  value={group.labels[field] || field}
                                  onChange={(e) => updateLabel(group.id, field, e.target.value)}
                                  className={`border-0 p-0 text-sm font-semibold text-center`}
                                />
                                {field !== "name" && field !== "actions" && (
                                  <button
                                    type="button"
                                    onClick={() => removeColumn(group.id, field)}
                                    className="absolute top-1 right-1 text-xs text-red-500 opacity-0 group-hover:opacity-100"
                                    title="Ustunni o'chirish"
                                  >
                                    ×
                                  </button>
                                )}
                              </th>
                            ))}
                            <th className="border border-gray-300 p-3 text-center font-semibold">
                              <Input value={group.labels.actions} onChange={(e) => updateLabel(group.id, "actions", e.target.value)} className="border-0 p-0 text-sm font-semibold text-center" />
                            </th>
                            {group.fields.map(() => (
                              <th key={Math.random()}></th>
                            ))}
                            <th className="p-2 text-center flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => addColumn(group.id)}
                                className="rounded-full bg-blue-500 hover:bg-blue-600 text-white w-8 h-8 flex items-center justify-center shadow transition"
                                title="Ustun qo'shish"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </th> 
                          </tr>
                        </thead>
                        <tbody>
                          {group.students.map((student, idx) => (
                            <tr key={student.id} className="hover:bg-gray-50">
                              {group.fields.map((field) => (
                                <td key={field} className="border border-gray-300 p-3">
                                  {field === "name" ? (
                                    <Input
                                      value={student.name}
                                      onChange={(e) => updateStudent(student.id, "name", e.target.value)}
                                      className="border-0 p-0 focus:ring-0"
                                    />
                                  ) : field === "additionalTask" ? (
                                    <div className="space-y-2">
                                      {Array.isArray(student.additionalTask) && student.additionalTask.map((note, noteIdx) => (
                                        <div key={noteIdx} className="flex gap-2">
                                          <Textarea
                                            value={note}
                                            onChange={(e) => updateNote(student.id, noteIdx, e.target.value)}
                                            placeholder={`Note ${noteIdx + 1}`}
                                            className="flex-1 min-h-[40px] resize-none break-words"
                                          />
                                          <Button size="sm" variant="destructive" onClick={() => removeNote(student.id, noteIdx)}>
                                            <Trash2 className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      ))}
                                      <div>
                                        <Button size="sm" onClick={() => addNote(student.id)} className="mt-1">
                                          <Plus className="w-4 h-4" /> Qo'shish
                                        </Button>
                                      </div>
                                    </div>
                                  ) : typeof student[field] === "boolean" ? (
                                    <button
                                      onClick={() => toggleField(student.id, field as keyof Student)}
                                      className="text-2xl hover:scale-110 transition-transform"
                                    >
                                      {student[field] ? "✅" : "❌"}
                                    </button>
                                  ) : (
                                    <Input
                                      value={student[field] ?? ""}
                                      onChange={(e) => updateStudent(student.id, field as keyof Student, e.target.value)}
                                      className="border-0 p-0 focus:ring-0"
                                    />
                                  )}
                                </td>
                              ))}
                              <td className="border border-gray-300 p-3 text-center flex flex-col gap-2 items-center">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeStudent(student.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Telegramga yuborish tugmasi */}
                    <div className="mt-6 flex justify-center gap-4">
                      <Button
                        onClick={sendToTelegram}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                      >
                        <Send className="w-5 h-5" />
                        Telegramga yuborish
                      </Button>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

