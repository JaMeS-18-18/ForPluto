"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Send, Trash2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  name: string
  doska: boolean
  essential: boolean
  speaking: boolean
  listening: boolean
  mindset: boolean
  murphy: boolean
  additionalTask: string
  destination: string
  done: boolean
}

export default function StudentManagement() {
  const { toast } = useToast()
  const [students, setStudents] = useState<Student[]>([])

  const [newStudentName, setNewStudentName] = useState("")

  useEffect(() => {
    const savedStudents = localStorage.getItem("students")
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents))
      } catch (error) {
        console.error("Error loading students from localStorage:", error)
      }
    }
  }, [])
  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem("students", JSON.stringify(students))
    } else {
      localStorage.removeItem("students") // hammasi o‘chirilsa localStorage tozalansin
    }
  }, [students])

  const addStudent = () => {
    if (newStudentName.trim()) {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: newStudentName.trim(),
        doska: false,
        essential: false,
        speaking: false,
        listening: false,
        mindset: false,
        murphy: false,
        additionalTask: "",
        destination: "",
        done: false,
      }
      setStudents([newStudent, ...students])
      setNewStudentName("")
      toast({
        title: "O'quvchi qo'shildi",
        description: `${newStudentName} ro'yxatga qo'shildi`,
      })
    }
  }

  const removeStudent = (id: string) => {
    setStudents(students.filter((student) => student.id !== id))
    toast({
      title: "O'quvchi o'chirildi",
      description: "O'quvchi ro'yxatdan o'chirildi",
    })
  }

  const updateStudent = (id: string, field: keyof Student, value: any) => {
    setStudents(students.map((student) => (student.id === id ? { ...student, [field]: value } : student)))
  }

  const toggleField = (id: string, field: keyof Student) => {
    setStudents(students.map((student) => (student.id === id ? { ...student, [field]: !student[field] } : student)))
  }

  const sendToTelegram = () => {
    try {
      const message = formatDataForTelegram()
      const encodedMessage = encodeURIComponent(message)

      // Open Telegram with pre-filled message to @online_xakker
      const telegramUrl = `https://t.me/online_xakker?text=${encodedMessage}`
      window.open(telegramUrl, "_blank")

      toast({
        title: "Telegram ochildi",
        description: "Xabar tayyor, faqat 'Send' tugmasini bosing",
      })
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Telegram ochishda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const exportToWord = () => {
    try {
      // Create HTML content that matches the original table format
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title> O'quvchilar hisoboti</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { text-align: center; margin-bottom: 30px; }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: center;
              vertical-align: middle;
            }
            th { 
              background-color: #f0f0f0; 
              font-weight: bold;
            }
            .name-col { text-align: left; }
            .done-col { background-color: #e8f5e8; }
            .additional-task { 
              text-align: left; 
              max-width: 200px;
              word-wrap: break-word;
            }
          </style>
        </head>
        <body>
          <h1></h1>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Doska</th>
                <th>essential</th>
                <th>speaking</th>
                <th>listening</th>
                <th>mindset</th>
                <th>murphy</th>
                <th>Additional task(essay, analysis)</th>
                <th>Destination</th>
                <th class="done-col">Done</th>
              </tr>
            </thead>
            <tbody>
      `

      students.forEach((student) => {
        htmlContent += `
          <tr>
            <td class="name-col">${student.name}</td>
            <td>${student.doska ? "✅" : "❌"}</td>
            <td>${student.essential ? "✅" : "❌"}</td>
            <td>${student.speaking ? "✅" : "❌"}</td>
            <td>${student.listening ? "✅" : "❌"}</td>
            <td>${student.mindset ? "✅" : "❌"}</td>
            <td>${student.murphy ? "✅" : "❌"}</td>
            <td class="additional-task">${student.additionalTask || ""}</td>
            <td>${student.destination || ""}</td>
            <td class="done-col">${student.done ? "✅" : "❌"}</td>
          </tr>
        `
      })

      htmlContent += `
            </tbody>
          </table>
        </body>
        </html>
      `

      // Create and download Word file (HTML format that Word can open)
      const blob = new Blob([htmlContent], {
        type: "application/msword;charset=utf-8",
      })
      const link = document.createElement("a")
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", `-students-${new Date().toISOString().split("T")[0]}.doc`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Word fayl yuklandi",
        description: "Jadval Word formatida yuklab olindi",
      })
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Faylni yuklashda xatolik yuz berdi",
        variant: "destructive",
      })
    }
  }

  const formatDataForTelegram = () => {
    let message = "📚  O'quvchilar hisoboti\n\n"

    students.forEach((student, index) => {
      message += `${index + 1}. ${student.name}\n`
      message += `Doska: ${student.doska ? "✅" : "❌"}\n`
      message += `Essential: ${student.essential ? "✅" : "❌"}\n`
      message += `Speaking: ${student.speaking ? "✅" : "❌"}\n`
      message += `Listening: ${student.listening ? "✅" : "❌"}\n`
      message += `Mindset: ${student.mindset ? "✅" : "❌"}\n`
      message += `Murphy: ${student.murphy ? "✅" : "❌"}\n`
      if (student.additionalTask) {
        message += `Additional task: ${student.additionalTask}\n`
      }
      if (student.destination) {
        message += `Destination: ${student.destination}\n`
      }
      message += `Done: ${student.done ? "✅" : "❌"}\n`
      message += "\n"
    })

    return message
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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

          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Hozircha o'quvchilar yo'q</p>
              <p className="text-sm">Yuqoridagi maydondan yangi o'quvchi qo'shing</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 p-3 text-left font-semibold">Name</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Doska</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Essential</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Speaking</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Listening</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Mindset</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Murphy</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">
                      Additional task
                      <br />
                      (essay, analysis)
                    </th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Destination</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold bg-green-100">Done</th>
                    <th className="border border-gray-300 p-3 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-3">
                        <Input
                          value={student.name}
                          onChange={(e) => updateStudent(student.id, "name", e.target.value)}
                          className="border-0 p-0 focus:ring-0"
                        />
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => toggleField(student.id, "doska")}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {student.doska ? "✅" : "❌"}
                        </button>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => toggleField(student.id, "essential")}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {student.essential ? "✅" : "❌"}
                        </button>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => toggleField(student.id, "speaking")}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {student.speaking ? "✅" : "❌"}
                        </button>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => toggleField(student.id, "listening")}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {student.listening ? "✅" : "❌"}
                        </button>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => toggleField(student.id, "mindset")}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {student.mindset ? "✅" : "❌"}
                        </button>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
                        <button
                          onClick={() => toggleField(student.id, "murphy")}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {student.murphy ? "✅" : "❌"}
                        </button>
                      </td>
                      <td className="border border-gray-300 p-3">
                        <Textarea
                          value={student.additionalTask}
                          onChange={(e) => updateStudent(student.id, "additionalTask", e.target.value)}
                          placeholder="Essay, analysis..."
                          className="min-h-[60px] resize-none"
                        />
                      </td>
                      <td className="border border-gray-300 p-3">
                        <Input
                          value={student.destination}
                          onChange={(e) => updateStudent(student.id, "destination", e.target.value)}
                          className="border-0 p-0 focus:ring-0"
                        />
                      </td>
                      <td className="border border-gray-300 p-3 text-center bg-green-50">
                        <button
                          onClick={() => toggleField(student.id, "done")}
                          className="text-2xl hover:scale-110 transition-transform"
                        >
                          {student.done ? "✅" : "❌"}
                        </button>
                      </td>
                      <td className="border border-gray-300 p-3 text-center">
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
          )}

          {students.length > 0 && (
            <div className="mt-6 flex justify-center gap-4">
              <Button
                onClick={exportToWord}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
              >
                <Download className="w-5 h-5" />
                Word ga yuklash
              </Button>
              <Button
                onClick={sendToTelegram}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
              >
                <Send className="w-5 h-5" />
                Telegramga yuborish
              </Button>
            </div>
          )}

          {/* <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Qanday ishlaydi:</h3>
            <p className="text-blue-700 text-sm">
              "Send" tugmasini bosganda Telegram ochiladi va @online_xakker bilan chat oynasi ochiladi. Xabar oldindan
              tayyor bo'ladi, faqat "Send" tugmasini bosishingiz kerak.
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  )
}
