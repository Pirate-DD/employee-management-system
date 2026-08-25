import { Router, type Response } from 'express'
import { authenticateToken, type AuthRequest } from '../middleware/auth.js'
import { statisticsService } from '../services/statisticsService.js'

const router = Router()

router.get('/overview', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = statisticsService.getOverview()
  res.json(result)
})

router.get('/departments', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = statisticsService.getDepartmentStats()
  res.json(result)
})

router.get('/attendance', authenticateToken, (req: AuthRequest, res: Response) => {
  const { startDate, endDate } = req.query
  const result = statisticsService.getAttendanceStats(
    startDate as string | undefined,
    endDate as string | undefined
  )
  res.json(result)
})

router.get('/salary', authenticateToken, (req: AuthRequest, res: Response) => {
  const { month } = req.query
  const result = statisticsService.getSalaryStats(month as string | undefined)
  res.json(result)
})

router.get('/positions', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = statisticsService.getPositionDistribution()
  res.json(result)
})

router.get('/gender', authenticateToken, (req: AuthRequest, res: Response) => {
  const result = statisticsService.getGenderDistribution()
  res.json(result)
})

router.get('/leaves', authenticateToken, (req: AuthRequest, res: Response) => {
  const { status } = req.query
  const result = statisticsService.getLeaveStats(status as string | undefined)
  res.json(result)
})

router.get('/trend', authenticateToken, (req: AuthRequest, res: Response) => {
  const { months } = req.query
  const result = statisticsService.getMonthlyTrend(months ? parseInt(months as string) : 6)
  res.json(result)
})

export default router